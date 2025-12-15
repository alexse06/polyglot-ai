'use server';

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper to buffer to base64
async function fileToGenerativePart(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
        inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.type
        },
    };
}

export async function analyzeCareerDocs(formData: FormData) {
    const cvFile = formData.get('cv') as File | null;
    const jobDescription = formData.get('jobDescription') as string || '';
    const interviewType = formData.get('type') as string || 'HR';

    if (!cvFile) {
        throw new Error("CV file is required");
    }

    try {
        const cvPart = await fileToGenerativePart(cvFile);

        const prompt = `
        ACT AS AN EXPERT RECRUITER ANALYST.
        
        I will provide you with a candidate's CV (PDF) and a Job Description.
        Your goal is to prepare a "Recruiter Briefing" for a Live AI Interviewer.
        
        INTERVIEW TYPE: ${interviewType} (Focus on ${interviewType === 'TECHNICAL' ? 'Hard skills, coding, technical depth' : 'Soft skills, culture fit, behavioral questions'}).
        
        JOB DESCRIPTION:
        "${jobDescription}"
        
        Analyze the CV and the Job Description.
        Output a structured SYSTEM INSTRUCTION for the Live AI.
        The output must be pure text (no markdown formatting like ** or ## if possible, but clear paragraphs are fine).
        
        The Output Structure should be:
        "You are an expert ${interviewType} Recruiter interviewing [Candidate Name]. 
        Your goal is to evaluate them for the position of [Role] at [Company].
        
        CANDIDATE CONTEXT:
        - Weaknesses/Gaps to probe: [List 2-3 specific concerns found in CV vs Job]
        - Key Experience to verify: [List 1-2 key projects]
        
        INTERVIEW STRATEGY:
        - Start by welcoming them and asking: [Specific opening question based on CV]
        - Be [Tone: e.g. Challenging but fairness for Tech, Warm but inquisitive for HR].
        - If they struggle with [Topic], dig deeper.
        
        Language: Keep the conversation in the language of the CV or local language (likely French or English)."
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        { text: prompt },
                        cvPart // structured part from fileToGenerativePart helper
                    ]
                }
            ]
        });

        // In the new Node SDK, response.text() might be a function, but the linter thinks it's a string.
        // However, looking at the error logic, if it says "Type 'String' has no call signatures", then response.text IS a string.
        const text = response.text;

        return { success: true, briefing: text };

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generateInterviewHint(lastQuestion: string, context: { briefing: string }) {
    try {
        const prompt = `
        ACT AS A CAREER COACH WHISPERER.
        
        CONTEXT:
        The user is in a live interview simulation.
        The AI Recruiter just asked: "${lastQuestion}"
        
        CANDIDATE BRIEFING/SKILLS SUMMARY:
        ${context.briefing.slice(0, 1500)}...
        
        TASK:
        Provide a "Cheat Sheet" for the candidate to answer this specific question.
        
        OUTPUT FORMAT (JSON):
        {
            "keyPoints": ["Point 1", "Point 2", "Point 3"],
            "suggestedStructure": "Brief advice on how to structure the answer (e.g. STAR method)",
            "exampleOpening": "A strong opening sentence..."
        }
        
        Keep it concise. The candidate is reading this in real-time.
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" }
        });

        const text = response.text || "{}";
        return { success: true, hint: JSON.parse(text) };

    } catch (error: any) {
        console.error("Hint Error:", error);
        return { success: false, error: "Could not generate hint." };
    }
}
