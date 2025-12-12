import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '@/lib/logger';
import { getConfig } from './languageConfig';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function getGeminiModel(modelName?: string) {
    // If no model provided, default to flash-2.0
    // But allow override from config
    return genAI.getGenerativeModel({ model: modelName || "gemini-2.0-flash" });
}

function sanitizeHistoryForGemini(history: { role: "user" | "model"; parts: { text: string }[] }[]) {
    if (!history || history.length === 0) return [];

    const sanitized: typeof history = [];
    let lastRole: "user" | "model" | null = null;

    // 1. Ensure first message is User. If Model, prepend dummy User.
    if (history[0].role === 'model') {
        sanitized.push({ role: 'user', parts: [{ text: "..." }] });
        lastRole = 'user';
    }

    // 2. Iterate and merge consecutive roles or add placeholders
    for (const msg of history) {
        if (msg.role === lastRole) {
            // Merge text with previous message of same role
            sanitized[sanitized.length - 1].parts[0].text += "\n\n" + msg.parts[0].text;
        } else {
            sanitized.push(msg);
            lastRole = msg.role;
        }
    }

    return sanitized;
}

// Helper to generate simple text (used by translation action)
export async function generateText(prompt: string) {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function generateConversationResponse(
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    userMessage: string,
    systemInstruction?: string,
    learningLanguage: string = "ES"
) {
    if (!apiKey) throw new Error("API Key missing");

    const start = Date.now();
    logger.info('Generating conversation response', { role: 'gemini', context: 'chat', historyLength: history.length, userMessageLength: userMessage.length });

    try {
        const model = await getGeminiModel();

        const config = getConfig(learningLanguage);

        // Enhanced prompt for transliteration
        const needsTransliteration = true; // Enabled for all languages per user request

        const prompt = `User message: "${userMessage}"
        
        ${systemInstruction ? `ROLEPLAY CONTEXT: ${systemInstruction}\nStay in character.` : config.aiPrompt.tutorPersona}
        ${config.aiPrompt.negativeConstraint}
        
        1. Respond naturally to the user in ${config.aiPrompt.targetLanguage} (as your character).
        2. Analyze their message for grammatical errors.
        3. Suggest a 3 potential distinct responses they could say next(in ${config.aiPrompt.targetLanguage}).
        4. PROVIDE TRANSLITERATION (or Phonetic Reading) for your response (e.g. IPA or easy-reading for a French speaker).
        
        RETURN ONLY A VALID JSON OBJECT:
{
    "text": "Your natural response here in ${config.aiPrompt.targetLanguage}",
    "transliteration": "Phonetic reading (e.g. 'Ola' for Hola, 'Konnichiwa' for こんにちは)",
        "correction": "Correction of user's input if needed, otherwise null"(String or null),
             "suggestions": ["Option 1", "Option 2", "Option 3"]
} `;

        // Sanitize history
        const sanitizedHistory = sanitizeHistoryForGemini(history);

        const chat = model.startChat({
            history: sanitizedHistory as any,
            generationConfig: {
                maxOutputTokens: 800,
                responseMimeType: "application/json"
            },
        });

        let responseText = "";
        console.log("Gemini Chat: Sending message...");
        const result = await chat.sendMessage(prompt);
        responseText = result.response.text();
        const usage = result.response.usageMetadata;

        const duration = Date.now() - start;
        logger.info('Gemini conversation response generated', {
            duration,
            responseLength: responseText.length,
            tokens: {
                input: usage?.promptTokenCount || 0,
                output: usage?.candidatesTokenCount || 0,
                total: usage?.totalTokenCount || 0
            }
        });

        return JSON.parse(responseText);
    } catch (e: any) {
        logger.error('Error generating conversation response', { error: e.message, stack: e.stack });
        console.error("Gemini Chat Error Details:", e);
        throw e;
    }

    // Fallback if model fails to JSON 
    // return {
    //     text: learningLanguage === 'EN' ? "I didn't understand that." : "No entendí eso.",
    //     correction: null,
    //     suggestions: []
    // };
}

export async function evaluateUserLevel(conversationSample: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();

    const targetLang = language === "EN" ? "English" : "Spanish";

    const prompt = `Analyze the following ${targetLang} conversation or text sample from a student. 
  Determine their CECRL level(A1, A2, B1, B2, C1, C2).
  Return ONLY a JSON object with this format: { "level": "A1", "explanation": "..." }
  
  Student text: "${conversationSample}"`;

    // ... rest of function (unchanged logic, just re-create to be safe or assuming snippet is short)
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { level: "A1", explanation: "Could not determine level, defaulting to A1." };
}

export async function generatePlacementQuestions(language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();

    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    // Ensure the prompt explicitly asks for questions determining the level of the *target language*
    const prompt = `Generate 5 multiple choice questions in ${targetLang} to determine a student's level in ${targetLang} (ranging from A1 to B2).
    The questions should valid grammar/vocabulary tests for ${targetLang}.
    Return valid JSON array of objects: [{ "question": "...", "options": ["A", "B", "C"], "correctAnswer": "A" }]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Basic cleaning if the model adds markdown
    const jsonMatch = text.match(/\[[\s\S]*\]/); // Expecting an array
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return [];
}

export async function generateLessonContent(topic: string, level: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();

    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    const needsTransliteration = true; // Use phonetic guide for all

    const prompt = `Create a ${targetLang} lesson about "${topic}" for level ${level}.
    The lesson should contain 3 exercises.
    
    IMPORTANT: The target language is ${targetLang}. All questions and answers must be appropriate for learning ${targetLang}.
    For "TRANSLATE_TO_TARGET", the 'correctAdjusted' MUST be in ${targetLang}.
    For "MULTIPLE_CHOICE", the options MUST be in ${targetLang}.
    MUST include "transliteration" field (phonetic reading) for ALL answers.
    
    Return a VALID JSON object with this structure:
{
    "title": "Lesson Title",
        "description": "Brief description",
            "exercises": [
                {
                    "type": "TRANSLATE_TO_TARGET",
                    "question": "Traduisez : Hello (word in source lang)",
                    "correctAdjusted": "Hola (word in ${targetLang})",
                    "transliteration": "Pronunciation (e.g. 'Oh-lah')",
                    "options": ["Option1", "Option2", "Option3"]
                },
                {
                    "type": "MULTIPLE_CHOICE",
                    "question": "How do you say 'Thank you' in ${targetLang}?",
                    "options": ["Gracias", "De nada", "Por favor"],
                    "correctAnswer": "Gracias"
                },
                {
                    "type": "COMPLETE_SENTENCE",
                    "question": "Fill in the blank sentence in ${targetLang}",
                    "correctAnswer": "word",
                    "options": [ "word", "wrong1", "wrong2" ]
                }
            ]
}
   ONLY RETURN JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to generate lesson content");
}

export async function generatePronunciationSentence(level: string, targetPhoneme: string = "General", language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();

    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    const needsTransliteration = true;

    const prompt = `Generate a single challenging ${targetLang} sentence for a student at level ${level}.
    FOCUS specifically on practicing the phoneme / concept: "${targetPhoneme}".
    
    The sentence should be naturally constructed but loaded with words containing "${targetPhoneme}".
    
    Return ONLY a JSON object: { "sentence": "...", "translation": "Sentence translation in French", "transliteration": "Phonetic reading" } `;

    console.log(`Generating sentence for level ${level} with target ${targetPhoneme} in ${targetLang}`);
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return JSON.parse(text);
    } catch (e) {
        console.error("Sentence Generation Error:", e);
        // Fallback
        return {
            sentence: language === "EN" ? "The quick brown fox jumps over the lazy dog." : "El perro corre rápido.",
            translation: language === "EN" ? "Le renard rapide saute par-dessus le chien paresseux." : "The dog runs fast."
        };
    }
}

export async function generateScenarioProfile(level: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();

    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    const prompt = `Create a unique roleplay scenario for a student learning ${targetLang} at level ${level}.
    The scenario should be realistic (travel, daily life, work, social).
    
    IMPORTANT: The user is learning ${targetLang}, so the AI character must speak ${targetLang}.
    
    Return a VALID JSON object with this structure:
{
    "title": "Scenario Title (in French)",
    "description": "Short description (in French)",
    "objective": "Clear objective for the user (in French)",
    "initialPrompt": "System instruction for the AI character. You are a native speaker of ${targetLang}. define who you are, where you are, and what the user wants. You STRICTLY speak ${targetLang}."
}
    
    ONLY RETURN JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to generate scenario");
}

export async function suggestNextLessonTopic(currentLevel: string, lastTopic: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();

    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    const prompt = `Based on the ${targetLang} learning curriculum, suggest the NEXT lesson topic for a student at level ${currentLevel} who just finished "${lastTopic}".
    
    Return a VALID JSON object:
{
    "title": "Short Title (French)",
        "topic": "Detailed topic (English) for generation context",
            "level": "${currentLevel}"
}
    
    ONLY RETURN JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return { title: "Vocabulaire Divers", topic: "General vocabulary practice", level: currentLevel };
}

export async function explainGrammarError(question: string, wrongAnswer: string, correctAnswer: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();
    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    const prompt = `You are a ${targetLang} teacher explaining a mistake to a French student.

    Context:
- Question / Task: "${question}"
    - Student Answer(Wrong): "${wrongAnswer}"
        - Correct Answer: "${correctAnswer}"
    
    Explain briefly(in French) why the student's answer is wrong and the correct one is right. Focus on the grammar rule or vocabulary difference. Keep it under 2 sentences.
    
    Return a VALID JSON object:
{
    "explanation": "Ta réponse..."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { explanation: "Une erreur a été détectée. Compare avec la réponse correcte." };
}

export async function evaluateConversation(history: any[], language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");
    const model = await getGeminiModel();
    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    // Flatten history to a string for analysis
    const transcript = history.map(h => `${h.role}: ${h.parts[0].text} `).join("\n");

    const prompt = `Analyze this ${targetLang} roleplay conversation between a user and an AI tutor.
    Transcript:
    ${transcript}
    
    Provide a detailed evaluation in French.
    Return a VALID JSON object:
{
    "score": 8, // Score out of 10 based on grammar, vocabulary, and objective completion
        "feedback": "Two sentence general feedback in French.",
            "vocabulary": ["Word1 (Translation)", "Word2 (Translation)"], // 3 good or missing words relevant to the scenario
                "tips": ["One specific actionable tip for next time"]
}
    ONLY RETURN JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }
    return {
        score: 5,
        feedback: "Bravo pour l'effort. Continuez à pratiquer !",
        vocabulary: [],
        tips: ["Essayez de faire des phrases plus complètes."]
    };
}

export async function generateAudio(text: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");

    // Strategy: Gemini 2.5 Flash TTS (Native Audio Generation)
    // Ref: https://ai.google.dev/gemini-api/docs/speech-generation?hl=fr#rest
    // The model typically used in docs is 'gemini-2.5-flash-preview-tts' (or 'gemini-2.5-flash-tts' per user request, but docs say preview).
    // Let's use the exact model from the documentation.
    const config = getConfig(language);
    const model = config.tts.model;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            {
                parts: [{ text: text }]
            }
        ],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: config.tts.voiceName
                    }
                }
            }
        }
    };

    console.log(`[Gemini TTS] Requesting Audio. Model: ${model}, Voice: ${config.tts.voiceName}, Lang: ${language}`);
    console.log("Speech Config Payload:", JSON.stringify(payload.generationConfig.speechConfig, null, 2));

    // Retry logic (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`Requesting Gemini TTS (Attempt ${attempt}):`, endpoint);
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`Gemini TTS Error (Attempt ${attempt}):`, response.status, err);
                if (attempt === 3) return null;
                await new Promise(r => setTimeout(r, 1000)); // Wait 1s before retry
                continue;
            }

            const data = await response.json();

            const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

            if (!audioPart || !audioPart.data) {
                console.error("Gemini TTS: No audio data found", JSON.stringify(data));
                if (attempt === 3) return null;
                continue;
            }

            // Convert Raw PCM (L16) to WAV
            // Gemini 2.5 Flash TTS returns: audio/L16;codec=pcm;rate=24000
            const pcmBuffer = Buffer.from(audioPart.data, 'base64');
            const wavBuffer = addWavHeader(pcmBuffer, 24000, 1, 16);
            const audioBase64 = wavBuffer.toString('base64');

            return { data: audioBase64, mimeType: "audio/wav" };

        } catch (e) {
            console.error(`Gemini TTS Fetch Error (Attempt ${attempt}):`, e);
            if (attempt === 3) return null;
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return null;
}

function addWavHeader(samples: Buffer, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = samples.length;
    const chunkSize = 36 + dataSize;

    const buffer = Buffer.alloc(44);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(chunkSize, 4);
    buffer.write('WAVE', 8);

    // fmt sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    return Buffer.concat([buffer, samples]);
}
// ... (existing code)

export async function evaluatePronunciationWithAudio(audioBase64: string, expectedText: string, language: string = "ES") {
    if (!apiKey) throw new Error("API Key missing");

    // Switch to 'gemini-2.5-flash' as explicitly requested for audio analysis.
    const model = await getGeminiModel("gemini-2.5-flash");
    const config = getConfig(language);
    const targetLang = config.aiPrompt.targetLanguage;

    const prompt = `Listen to this audio recording of a student learning ${targetLang}.
    The student is trying to say: "${expectedText}".
    
    1. Transcribe what you hear exactly.
    2. Rate the pronunciation on a scale of 1-10.
    3. Analyze the accent specifically:
       - identifying specific letters (r, j, ll) mispronounced.
       - intonation and rhythm.
       - tell them if they sound like a native or have a foreign accent (and which one).
    
    Return a VALID JSON object:
    {
       "transcription": "What you heard",
       "score": 8, // Integer 1-10
       "feedback": "Detailed accent advice in French (e.g. 'Tu roules bien les R, mais le J est trop dur').",
       "correct": true // true if the sentence was understandable
    }`;

    try {
        console.log("Sending audio to Gemini...");
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/webm",
                    data: audioBase64
                }
            },
            { text: prompt }
        ]);

        const responseText = result.response.text();
        console.log("Gemini Audio Response:", responseText);

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return JSON.parse(responseText);
    } catch (e) {
        console.error("Gemini Audio Eval Parse Error", e);
        return {
            transcription: "Erreur technique",
            score: 0,
            feedback: "Désolé, l'analyse audio a échoué (Modèle introuvable ou erreur réseau).",
            correct: false
        };
    }
}

