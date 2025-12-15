"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Mic, MicOff, PhoneOff, PhoneCall, Activity, Volume2, Sparkles, BookOpen, Coffee, Stethoscope, Briefcase, HelpCircle, X, MessageSquare } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer'; // Import

// --- Constants & Types ---

const MODEL_NAME = "gemini-2.5-flash-native-audio-preview-12-2025";

interface LiveCoachProps {
    language: string;
    targetLanguageName?: string;
    userNativeLanguageName?: string;
    initialMessage?: string;
    apiKey: string | null;
    customSystemInstruction?: string;
    hideRoleSelector?: boolean;
    onTranscriptUpdate?: (transcript: Transcript) => void;
}

export interface Transcript {
    role: 'user' | 'model';
    text: string;
}

interface Correction {
    original: string;
    correction: string;
    explanation: string;
}

// Localized Roles Helper
const getRoles = (lang: string) => {
    // Default to defaults if language not found, but we will provide main ones.
    // Note: We keep the IDs stable.

    const descriptions: Record<string, any> = {
        'ES': {
            tutor: 'Eres María, una tutora de idiomas entusiasta y paciente. Tu objetivo es aumentar la confianza del estudiante. Habla con claridad y un poco más despacio de lo normal. Corrige los errores importantes reformulando suavemente, pero no interrumpas el flujo. Haz preguntas abiertas sobre su vida para fomentar el habla. Sé solidaria y usa un tono cálido.',
            barista: 'Eres Diego, el barista más genial de "Café Sol". El ambiente es enérgico, con sonidos de cafetera de fondo. Eres hablador, encantador y usas jerga casual apropiada para una cafetería. Quieres saber los detalles de su pedido, pero también cómo va su día. Mantén la charla ágil y urbana.',
            doctor: 'Eres la Dra. Elena, una médica altamente competente y empática. Estás realizando un triaje. Tu tono es tranquilo, tranquilizador, pero enfocado. Usa terminología médica precisa al explicar, pero haz preguntas simples. Pasos: 1. Síntomas, 2. Duración, 3. Nivel de dolor, 4. Diagnóstico/Consejo. Haz que el usuario se sienta cuidado.',
            interviewer: 'Eres Marcus Sterling, gerente de adquisición de talento en una empresa tecnológica líder. Eres profesional, agudo y orientado a resultados. Estás evaluando las "Habilidades Blandas" y el "Ajuste Cultural" del candidato. Haz preguntas de comportamiento ("Cuéntame sobre una vez que..."). Desafía sus respuestas ligeramente para ver cómo reaccionan bajo presión, pero mantén la profesionalidad.'
        },
        'FR': {
            tutor: 'Vous êtes Maria, une tutrice de langues enthousiaste et patiente. Votre objectif est de renforcer la confiance de l\'étudiant. Parlez clairement et un peu plus lentement que la normale. Corrigez les erreurs importantes en reformulant doucement, mais n\'interrompez pas le flux. Posez des questions ouvertes sur leur vie pour encourager la parole. Soyez encourageante et chaleureuse.',
            barista: 'Vous êtes Diego, le barista le plus cool du "Café Sol". L\'ambiance est énergique. Vous êtes bavard, charmant et utilisez un argot décontracté approprié pour un café. Vous voulez connaître les détails de leur commande, mais aussi comment se passe leur journée. Gardez la conversation vive et urbaine.',
            doctor: 'Vous êtes le Dr Elena, un médecin très compétent et empathique. Vous effectuez un triage. Votre ton est calme, rassurant mais concentré. Utilisez une terminologie médicale précise lors des explications, mais posez des questions simples. Étapes : 1. Symptômes, 2. Durée, 3. Niveau de douleur, 4. Diagnostic/Conseil. Faites sentir à l\'utilisateur qu\'il est pris en charge.',
            interviewer: 'Vous êtes Marcus Sterling, responsable du recrutement dans une grande entreprise tech. Vous êtes professionnel, perspicace et axé sur les résultats. Vous évaluez les "Soft Skills" et le "Fit Culturel". Posez des questions comportementales ("Parlez-moi d\'une fois où..."). Challengez légèrement leurs réponses pour voir leur réaction sous pression, mais restez professionnel.'
        },
        'DE': {
            tutor: 'Du bist Maria, eine enthusiastische und geduldige Sprachtutorin. Dein Ziel ist es, das Selbstvertrauen des Schülers zu stärken. Sprich deutlich und etwas langsamer als normal. Korrigiere wichtige Fehler durch sanftes Umformulieren, aber unterbrich nicht den Fluss. Stelle offene Fragen über ihr Leben. Sei unterstützend und warmherzig.',
            barista: 'Du bist Diego, der coolste Barista im "Café Sol". Die Atmosphäre ist energiegeladen. Du bist gesprächig, charmant und verwendest lockere Umgangssprache. Du willst die Details ihrer Bestellung wissen, aber auch, wie ihr Tag läuft. Halte das Gespräch flott und urban.',
            doctor: 'Du bist Dr. Elena, eine kompetente und einfühlsame Ärztin. Du führst eine Triage durch. Dein Ton ist ruhig, beruhigend, aber fokussiert. Verwende präzise medizinische Fachbegriffe beim Erklären, aber stelle einfache Fragen. Schritte: 1. Symptome, 2. Dauer, 3. Schmerzlevel, 4. Diagnose/Rat. Gib dem Benutzer das Gefühl, gut aufgehoben zu sein.',
            interviewer: 'Du bist Marcus Sterling, Talent Acquisition Manager bei einer Top-Tech-Firma. Du bist professionell, scharfsinnig und ergebnisorientiert. Du bewertest "Soft Skills" und "Cultural Fit". Stelle Verhaltensfragen ("Erzähl mir von einem Mal, als..."). Fordere ihre Antworten leicht heraus, um ihre Reaktion unter Druck zu sehen, bleibe aber professionell.'
        },
        'IT': {
            tutor: 'Sei Maria, una tutor di lingue entusiasta e paziente. Il tuo obiettivo è aumentare la fiducia dello studente. Parla chiaramente e un po\' più lentamente del normale. Correggi gli errori importanti riformulando gentilmente, ma non interrompi il flusso. Fai domande aperte sulla loro vita. Sii solidale e usa un tono caldo.',
            barista: 'Sei Diego, il barista più cool del "Café Sol". L\'atmosfera è energica. Sei loquace, affascinante e usi uno slang informale appropriato per un caffè. Vuoi sapere i dettagli del loro ordine, ma anche come va la loro giornata. Mantieni la conversazione vivace e urbana.',
            doctor: 'Sei la Dott.ssa Elena, un medico altamente competente ed empatico. Stai effettuando un triage. Il tuo tono è calmo, rassicurante ma concentrato. Usa terminologia medica precisa quando spieghi, ma fai domande semplici. Passaggi: 1. Sintomi, 2. Durata, 3. Livello di dolore, 4. Diagnosi/Consiglio. Fai sentire l\'utente accudito.',
            interviewer: 'Sei Marcus Sterling, responsabile acquisizione talenti in una top tech firm. Sei professionale, acuto e orientato ai risultati. Stai valutando le "Soft Skills" e il "Cultural Fit". Fai domande comportamentali ("Raccontami di una volta che..."). Sfida leggermente le loro risposte per vedere come reagiscono sotto pressione, ma rimani professionale.'
        },
        'PT': {
            tutor: 'Você é Maria, uma tutora de idiomas entusiasmada e paciente. Seu objetivo é aumentar a confiança do aluno. Fale com clareza e um pouco mais devagar que o normal. Corrija erros importantes reformulando gentilmente, mas não interrompa o fluxo. Faça perguntas abertas sobre a vida deles. Seja solidária e use um tom caloroso.',
            barista: 'Você é Diego, o barista mais legal do "Café Sol". A atmosfera é energética. Você é falante, charmoso e usa gírias casuais apropriadas para um café. Você quer saber os detalhes do pedido, mas também como está o dia deles. Mantenha a conversa viva e urbana.',
            doctor: 'Você é a Dra. Elena, uma médica altamente competente e empática. Você está fazendo uma triagem. Seu tom é calmo, tranquilizador, mas focado. Use terminologia médica precisa ao explicar, mas faça perguntas simples. Passos: 1. Sintomas, 2. Duração, 3. Nível de dor, 4. Diagnóstico/Conselho. Faça o usuário se sentir cuidado.',
            interviewer: 'Você é Marcus Sterling, gerente de aquisição de talentos em uma grande empresa de tecnologia. Você é profissional, perspicaz e orientado a resultados. Você está avaliando "Soft Skills" e "Cultural Fit". Faça perguntas comportamentais ("Conte-me sobre uma vez que..."). Desafie levemente as respostas para ver a reação sob pressão, mas mantenha o profissionalismo.'
        },
        'JP': {
            tutor: 'あなたはマリア、熱心で忍耐強い語学教師です。目標は生徒の自信を高めることです。普段より少しゆっくり、はっきりと話してください。重要な間違いは優しく言い直して訂正しますが、会話の流れを止めないでください。生徒の生活について自由な質問をして、発話を促しましょう。協力的で温かい口調で。',
            barista: 'あなたは「カフェ・ソル」で一番クールなバリスタ、ディエゴです。店は活気に満ちています。あなたは話し好きで魅力的、カフェにふさわしいカジュアルな言葉遣いをします。注文の詳細だけでなく、客の1日がどうかも聞きたいと思っています。会話を生き生きと、都会的に保ちましょう。',
            doctor: 'あなたはエレナ医師、非常に有能で共感力のある医師です。トリアージを行っています。口調は穏やかで安心感を与えますが、集中しています。説明時は正確な医学用語を使いますが、質問は簡単に。手順：1.症状、2.期間、3.痛みのレベル、4.診断/アドバイス。ユーザーに大切にされていると感じさせてください。',
            interviewer: 'あなたはマーカス・スターリング、大手テック企業の人材獲得マネージャーです。プロフェッショナルで鋭く、結果重視です。「ソフトスキル」と「カルチャーフィット」を評価しています。行動面接の質問（「〜した時のことを教えてください」）をします。プレッシャーへの反応を見るために少し答えに異議を唱えますが、プロフェッショナルさを保ってください。'
        },
        'CN': {
            tutor: '你是 Maria，一位热情耐心的语言导师。你的目标是增强学生的自信心。说话要清晰，比平时稍慢。通过温和的重述纠正重要错误，但不要打断对话流。询问关于他们生活的开放式问题以鼓励开口。态度要支持和温暖。',
            barista: '你是 Diego，“阳光咖啡馆”最酷的咖啡师。气氛充满活力。你健谈、迷人，使用适合咖啡馆的休闲俚语。你想知道订单细节，也想知道他们这一天过得如何。保持对话生动和都市感。',
            doctor: '你是 Elena 医生，一位能力极强且富有同情心的医生。你正在进行分诊。语气冷静、令人安心但专注。解释时使用精确的医学术语，但提问要简单。步骤：1.症状，2.持续时间，3.疼痛等级，4.诊断/建议。让用户感到被关怀。',
            interviewer: '你是 Marcus Sterling，一家顶尖科技公司的人才招聘经理。你专业、敏锐且注重结果。你正在评估“软技能”和“文化契合度”。提出行为面试问题（“告诉我一次你……”）。稍微挑战他们的回答以观察压力下的反应，但保持专业。'
        },
        'RU': {
            tutor: 'Вы Мария, полный энтузиазма и терпеливый языковой репетитор. Ваша цель - повысить уверенность ученика. Говорите четко и немного медленнее обычного. Исправляйте важные ошибки, мягко перефразируя, но не прерывайте поток речи. Задавайте открытые вопросы об их жизни. Будьте отзывчивы и говорите теплым тоном.',
            barista: 'Вы Диего, самый крутой бариста в "Café Sol". Атмосфера энергичная. Вы разговорчивы, обаятельны и используете непринужденный сленг, уместный в кафе. Вы хотите узнать детали заказа, а также как прошел их день. Поддерживайте живой и городской ритм беседы.',
            doctor: 'Вы доктор Елена, высококомпетентный и чуткий врач. Вы проводите первичный осмотр (триаж). Ваш тон спокоен, обнадеживает, но сосредоточен. Используйте точную медицинскую терминологию при объяснении, но задавайте простые вопросы. Шаги: 1. Симптомы, 2. Продолжительность, 3. Уровень боли, 4. Диагноз/Совет. Пусть пользователь чувствует заботу.',
            interviewer: 'Вы Маркус Стерлинг, менеджер по подбору талантов в ведущей технологической компании. Вы профессиональны, проницательны и ориентированы на результат. Вы оцениваете "Soft Skills" и "Cultural Fit". Задавайте поведенческие вопросы ("Расскажите мне о случае, когда..."). Слегка оспаривайте их ответы, чтобы увидеть реакцию под давлением, но оставайтесь профессионалом.'
        }
    };

    // Alias handling for JP/CN
    const rKey = lang === 'JP' ? 'JP' : lang === 'CN' ? 'CN' : (descriptions[lang] ? lang : 'ES');
    const desc = descriptions[rKey];

    // Fallback if desc is missing (should cover main langs)
    const t = (id: string) => desc?.[id] || descriptions['ES'][id] || "";

    return [
        {
            id: 'tutor',
            label: 'Tutor',
            icon: BookOpen,
            prompt: t('tutor'),
            voiceName: 'Aoede'
        },
        {
            id: 'barista',
            label: 'Barista',
            icon: Coffee,
            prompt: t('barista'),
            voiceName: 'Fenrir'
        },
        {
            id: 'doctor',
            label: 'Doctor',
            icon: Stethoscope,
            prompt: t('doctor'),
            voiceName: 'Kore'
        },
        {
            id: 'interviewer',
            label: 'Recruiter',
            icon: Briefcase,
            prompt: t('interviewer'),
            voiceName: 'Charon'
        },
    ];
}

export default function LiveCoachClient({ language, targetLanguageName, userNativeLanguageName, initialMessage, apiKey, customSystemInstruction, hideRoleSelector, onTranscriptUpdate }: LiveCoachProps) {
    // Dynamic Roles based on Language
    const roles = getRoles(language);

    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Ready to call");
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [audioVolume, setAudioVolume] = useState(0);
    const [currentRole, setCurrentRole] = useState(roles[0]); // Start with Tutor
    const [correction, setCorrection] = useState<Correction | null>(null);
    const [selectedWord, setSelectedWord] = useState<{ word: string, translation: string } | null>(null);

    // PTT State
    const [isPttMode, setIsPttMode] = useState(false); // Default to Auto (VAD)
    const [isPttActive, setIsPttActive] = useState(false);

    // Refs
    const wsSessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<AudioWorkletNode | null>(null);
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const audioBufferRef = useRef<Uint8Array | null>(null); // Buffer for small chunks
    const isPlayingRef = useRef(false);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const isMutedRef = useRef(isMuted);
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // PTT Refs
    const isPttModeRef = useRef(false);
    const isPttActiveRef = useRef(false);

    // Watchdog Refs (Fix for "AI stops listening after silence")
    const lastAudioSentAtRef = useRef<number>(0);
    const audioStreamEndedRef = useRef<boolean>(false);
    const silenceIntervalRef = useRef<number | null>(null);
    const isSpeakingRef = useRef<boolean>(false); // Track if user is currently speaking

    // Sync Refs
    useEffect(() => {
        isMutedRef.current = isMuted;
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
        }
    }, [isMuted]);

    // Sync PTT Refs
    useEffect(() => {
        isPttModeRef.current = isPttMode;
        isPttActiveRef.current = isPttActive;
    }, [isPttMode, isPttActive]);

    // Volume Visualizer
    useEffect(() => {
        const updateVolume = () => {
            if (analyserRef.current && isConnected) {
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
                setAudioVolume(avg / 255);
            } else {
                setAudioVolume(0);
            }
            animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isConnected]);

    // Cleanup on Unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    // --- Helper Functions (Hoisted) ---

    const stopAudio = () => {
        if (currentSourceRef.current) {
            try {
                currentSourceRef.current.stop();
            } catch (e) { /* ignore */ }
            currentSourceRef.current = null;
        }
        audioQueueRef.current = []; // Clear queue
        isPlayingRef.current = false;
        setIsSpeaking(false);
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
        }
    };

    const playAudioQueue = async () => {
        if (!audioContextRef.current) return;

        // If we are adding to the queue, ensure we don't erroneously think we stopped.
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
        }

        // Gate Logic: We are definitely speaking now or will be soon
        isPlayingRef.current = true;
        setIsSpeaking(true);

        if (audioQueueRef.current.length === 0) {
            return;
        }

        while (audioQueueRef.current.length > 0) {
            const nextChunk = audioQueueRef.current.shift();
            if (!nextChunk) continue;

            if (audioContextRef.current.state === 'suspended') {
                console.log("⚠️ AudioContext suspended. Attempting resume...");
                await audioContextRef.current.resume();
                console.log("✅ AudioContext resumed. State:", audioContextRef.current.state);
            }

            try {
                // Determine 24kHz standard for Gemini Live Output
                const sampleRate = 24000;
                const int16Data = new Int16Array(nextChunk);
                const float32Data = new Float32Array(int16Data.length);
                for (let i = 0; i < int16Data.length; i++) {
                    float32Data[i] = int16Data[i] / 32768.0;
                }

                const buffer = audioContextRef.current.createBuffer(1, float32Data.length, sampleRate);
                buffer.getChannelData(0).set(float32Data);

                const source = audioContextRef.current.createBufferSource();
                // Track source to stop it if needed
                currentSourceRef.current = source;
                source.buffer = buffer;
                source.connect(audioContextRef.current.destination);

                // Schedule
                const currentTime = audioContextRef.current.currentTime;
                // Graceful timeline: If fell behind, reset.
                if (nextStartTimeRef.current < currentTime) {
                    console.warn("⚠️ Audio fell behind, resetting timeline. Gap:", (currentTime - nextStartTimeRef.current).toFixed(3));
                    nextStartTimeRef.current = currentTime + 0.05;
                }

                console.log(`🔊 Playing Chunk | Duration: ${buffer.duration.toFixed(2)}s | Time: ${nextStartTimeRef.current.toFixed(2)} | Ctx: ${audioContextRef.current.state}`);
                source.start(nextStartTimeRef.current);

                // Advance timer
                const duration = buffer.duration;
                nextStartTimeRef.current += duration;

                source.onended = () => {
                    // DEBOUNCE: Don't set isPlaying=false immediately.
                    // Wait to see if more audio arrives (Network Lag Bridging).
                    if (audioQueueRef.current.length === 0) {
                        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
                        playbackTimeoutRef.current = setTimeout(() => {
                            if (audioQueueRef.current.length === 0) {
                                setIsSpeaking(false);
                                isPlayingRef.current = false;
                                playbackTimeoutRef.current = null;
                                currentSourceRef.current = null; // FIX: Clear stale ref to allow next playback trigger
                            }
                        }, 600);
                    }
                };

            } catch (err) {
                console.error("Playback Error", err);
            }
        }
    };

    const setupAudioProcessing = async (audioContext: AudioContext, stream: MediaStream, session: any) => {
        try {
            await audioContext.audioWorklet.addModule('/pcm-processor.js');
        } catch (e) { throw new Error("Audio Worklet Load Failed"); }



        if (audioContext.state === 'closed') return;

        const source = audioContext.createMediaStreamSource(stream);
        const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
        (processorRef.current as any) = workletNode;

        const startTime = Date.now();
        const contextSampleRate = audioContext.sampleRate;

        // WATCHDOG REMOVED: conflicting with automatic VAD. 
        // We now rely on Gemini's auto-detection or the manual "Reply Now" button.

        workletNode.port.onmessage = (event) => {
            // 1. Warmup (Increased to 1.5s to settle mic)
            if (Date.now() - startTime < 1500) return;

            // Debug Mic Input (Throttled)
            // if (Math.random() < 0.01) console.log("🎤 Mic Raw Activity (Worklet Running)");

            // 2. Software AEC (Input Gate)
            // DISABLED for Debugging: Allow "Barge In" to prevent stuck mute state.
            // if (isPlayingRef.current) return;

            // PTT Logic
            if (isPttModeRef.current && !isPttActiveRef.current) {
                // If in PTT mode and button NOT held, drop audio.
                return;
            }

            const inputData = event.data;
            let buffer = new Float32Array(inputData);

            // 3. Resampling (Linear Interpolation) if Context != 16k
            if (contextSampleRate !== 16000) {
                const ratio = contextSampleRate / 16000;
                const newLength = Math.floor(buffer.length / ratio);
                const resampled = new Float32Array(newLength);

                for (let i = 0; i < newLength; i++) {
                    const idx = i * ratio;
                    const intIdx = Math.floor(idx);
                    const frac = idx - intIdx;

                    // Linear Interpolation: (1-t)*a + t*b
                    const a = buffer[intIdx] || 0;
                    const b = buffer[intIdx + 1] || a;
                    resampled[i] = a + (b - a) * frac;
                }
                buffer = resampled;
            }

            // DIGITAL GAIN (Pre-amp)
            // Boost input volume by 4x since user mic is very quiet (~0.0002 RMS)
            const inputGain = 4.0;
            for (let i = 0; i < buffer.length; i++) {
                buffer[i] *= inputGain;
            }

            // RMS
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
            const rms = Math.sqrt(sum / buffer.length);

            // Skip silence (automatic VAD will handle detection)
            if (rms < 0.0001) return;
            if (isMutedRef.current) return;

            // Convert
            const pcm16 = new Int16Array(buffer.length);
            for (let i = 0; i < buffer.length; i++) {
                let s = Math.max(-1, Math.min(1, buffer[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));

            if (wsSessionRef.current) {
                // Double check connected state to avoid "WebSocket is already in CLOSING or CLOSED state"
                try {
                    // if (Math.random() < 0.01) console.log("🎤 Sending >> RMS:", rms.toFixed(4));
                    // Try sending as 'media' (Blob) as per JSDoc, or 'audio' as per types. Sending both to cover SDK variances.
                    const blob = { mimeType: "audio/pcm;rate=16000", data: base64 };
                    wsSessionRef.current.sendRealtimeInput({ media: blob, audio: blob });
                } catch (e) {
                    // Silent fail if socket closed mid-frame
                    console.debug("Socket send failed", e);
                }
            }
        };

        source.connect(workletNode);
        // Do NOT connect worklet to destination (prevents feedback/echo)
        // workletNode.connect(audioContext.destination);
    };

    const disconnect = (reason?: string) => {
        if (reason) console.log(`Disconnecting: ${reason}`);
        stopAudio();
        if (wsSessionRef.current) {
            wsSessionRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsConnected(false);
        setIsSpeaking(false);
        setStatus("Ready to call");
        setTranscripts([]);
        setCorrection(null);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const changeRole = (role: any) => {
        setCurrentRole(role);
        if (isConnected) {
            disconnect();
        }
        setTranscripts(prev => [...prev, { role: 'user', text: `(Switched to ${role.label})` }]);
    };

    // Helper for Interactive Text
    const renderInteractiveText = (text: string) => {
        return text.split(' ').map((word, i) => (
            <span
                key={i}
                className="cursor-pointer hover:bg-indigo-500/30 hover:text-white hover:underline decoration-indigo-400 rounded px-0.5 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    // Mock Translation Logic (For visual demo)
                    // In real app: fetch(`/ api / translate ? word = ${ word } `)
                    setSelectedWord({
                        word: word.replace(/[.,!?]/g, ''),
                        translation: "Simulated Translation"
                    });
                }}
            >
                {word}{' '}
            </span>
        ));
    };

    const LANGUAGE_CODES: Record<string, string> = {
        'ES': 'es-US',
        'FR': 'fr-FR',
        'DE': 'de-DE',
        'IT': 'it-IT',
        'EN': 'en-US',
        'PT': 'pt-BR',
        'JP': 'ja-JP',
        'JA': 'ja-JP',
        'CN': 'cmn-CN',
        'ZH': 'cmn-CN',
        'RU': 'ru-RU'
    };
    const targetBCP47 = LANGUAGE_CODES[language] || 'en-US';

    // --- Connect Function ---
    const connect = async () => {
        try {
            setStatus("Requesting Microphone...");
            setError(null);

            // 1. Get Microphone stream FIRST
            // 1. Get raw stream (Disable processing to fix "Quiet Mic")
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            });
            mediaStreamRef.current = stream;

            // 2. Initialize Audio Context
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContext(); // Native sample rate
            audioContextRef.current = audioContext;

            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // Analyser Setup
            analyserRef.current = audioContext.createAnalyser();
            analyserRef.current.fftSize = 256;

            // 3. Connect to Live API
            setStatus("Connecting to AI...");
            if (!apiKey) throw new Error("API Key missing");
            const genAI = new GoogleGenAI({ apiKey });

            // System Instructions
            const roleInstruction = customSystemInstruction || currentRole.prompt;

            // LOCALIZED HANDSHAKES (The "Hidden" first message)
            const HANDSHAKE_PROMPTS: Record<string, string> = {
                'ES': `[SISTEMA]: Comienza el juego de rol ahora. Habla inmediatamente en Español con acento nativo. \nContexto: ${initialMessage}`,
                'FR': `[SYSTÈME]: Commencez le jeu de rôle maintenant. Parlez immédiatement en Français avec un accent natif. \nContexte : ${initialMessage}`,
                'DE': `[SYSTEM]: Beginne das Rollenspiel jetzt. Sprich sofort auf Deutsch mit muttersprachlichem Akzent. \nKontext: ${initialMessage}`,
                'IT': `[SISTEMA]: Inizia subito il gioco di ruolo. Parla immediatamente in Italiano con accento nativo. \nContesto: ${initialMessage}`,
                'PT': `[SISTEMA]: Comece o roleplay agora. Fale imediatamente em Português com sotaque nativo. \nContexto: ${initialMessage}`,
                'JP': `[SYSTEM]: 今すぐロールプレイを開始してください。すぐにネイティブなアクセントで日本語を話してください。 \nコンテキスト: ${initialMessage}`,
                'CN': `[SYSTEM]: 现在开始角色扮演。立即以母语口音说中文。 \n背景: ${initialMessage}`,
                'RU': `[СИСТЕМА]: Начните ролевую игру сейчас. Говорите сразу по-русски с родным акцентом. \nКонтекст: ${initialMessage}`,
                'EN': `[SYSTEM]: Start the roleplay now. Speak immediately in English. \nContext: ${initialMessage}`
            };
            // Map aliases
            const handshakeKey = language === 'JA' ? 'JP' : language === 'ZH' ? 'CN' : language;
            const handshake = HANDSHAKE_PROMPTS[handshakeKey] || HANDSHAKE_PROMPTS[language] || HANDSHAKE_PROMPTS['EN'];

            // LOCALIZED SYSTEM PROMPTS ... (Existing map ...)
            const SYSTEM_PROMPTS: Record<string, string> = {
                'ES': `
Eres un tutor de idiomas útil y amigable.
Idioma Objetivo: Español (${targetBCP47}).
Idioma del Estudiante: ${userNativeLanguageName || 'Inglés'}.

PAUTAS:
1. ROL PRINCIPAL: Actúa completamente como el personaje definido.
2. REGLA DE IDIOMA: Habla SOLO en Español por defecto.
3. REGLA DE ACENTO: Debes hablar con un acento nativo (Localización: ${targetBCP47}). NO uses acento inglés.
4. EXCEPCIÓN: Usa ${userNativeLanguageName || 'Inglés'} SOLO si:
   - El usuario está claramente confundido.
   - Necesitas explicar un punto gramatical complejo.
   - El usuario pide explícitamente una traducción.
5. EVITA ESTRICTAMENTE el "Spanglish" o mezclar idiomas.
6. Mantén las respuestas concisas (1-3 oraciones).
`,
                'FR': `
Vous êtes un tuteur de langues utile et amical.
Langue Cible: Français (${targetBCP47}).
Langue de l'Étudiant: ${userNativeLanguageName || 'Anglais'}.

DIRECTIVES:
1. RÔLE PRINCIPAL: Incarnez complètement le personnage défini.
2. RÈGLE DE LANGUE: Parlez UNIQUEMENT en Français par défaut.
3. RÈGLE D'ACCENT: Vous DEVEZ parler avec un accent natif (Locale: ${targetBCP47}). N'utilisez PAS d'accent anglais.
4. EXCEPTION: Utilisez l'${userNativeLanguageName || 'Anglais'} UNIQUEMENT si:
   - L'utilisateur est clairement confus.
   - Vous devez expliquer un point de grammaire complexe.
   - L'utilisateur demande explicitement une traduction.
5. ÉVITEZ STRICTEMENT le "Franglais" ou le mélange des langues.
6. Gardez les réponses concises (1-3 phrases).
`,
                'DE': `
Du bist ein hilfreicher und freundlicher Sprachtutor.
Zielsprache: Deutsch (${targetBCP47}).
Sprache des Schülers: ${userNativeLanguageName || 'Englisch'}.

RICHTLINIEN:
1. HAUPTROLLE: Handele vollständig als der definierte Charakter.
2. SPRACHREGEL: Sprich standardmäßig NUR Deutsch.
3. AKZENTREGEL: Du MUSST mit einem muttersprachlichen Akzent sprechen. Verwende KEINEN englischen Akzent.
4. AUSNAHME: Verwende ${userNativeLanguageName || 'Englisch'} NUR wenn:
   - Der Benutzer offensichtlich verwirrt ist.
   - Du einen komplexen Grammatikpunkt erklären musst.
   - Der Benutzer ausdrücklich um eine Übersetzung bittet.
5. Vermeide strikt "Denglisch" oder das Mischen von Sprachen.
6. Halte die Antworten kurz (1-3 Sätze).
`,
                'IT': `
Sei un tutor di lingue utile e amichevole.
Lingua di destinazione: Italiano (${targetBCP47}).
Lingua dello studente: ${userNativeLanguageName || 'Inglese'}.

LINEE GUIDA:
1. RUOLO PRINCIPALE: Agisci completamente come il personaggio definito.
2. REGOLA DELLA LINGUA: Parla SOLO in Italiano per impostazione predefinita.
3. REGOLA DELL'ACCENTO: DEVI parlare con un accento nativo. NON usare un accento inglese.
4. ECCEZIONE: Usa ${userNativeLanguageName || 'Inglese'} SOLO se:
   - L'utente è chiaramente confuso.
   - Devi spiegare un punto grammaticale complesso.
   - L'utente chiede esplicitamente una traduzione.
5. EVITARE RIGOROSAMENTE di mescolare le lingue.
6. Mantieni le risposte concise (1-3 frasi).
`,
                'PT': `
Você é um tutor de idiomas útil e amigável.
Idioma Alvo: Português (${targetBCP47}).
Idioma do Estudante: ${userNativeLanguageName || 'Inglês'}.

DIRETRIZES:
1. PAPEL PRINCIPAL: Aja completamente como o personagem definido.
2. REGRA DE IDIOMA: Fale APENAS em Português por padrão.
3. REGRA DE SOTAQUE: Você DEVE falar com sotaque nativo. NÃO use sotaque inglês.
4. EXCEÇÃO: Use ${userNativeLanguageName || 'Inglês'} APENAS se:
   - O usuário estiver claramente confuso.
   - Você precisar explicar um ponto gramatical complexo.
   - O usuário pedir explicitamente uma tradução.
5. EVITE ESTRITAMENTE misturar idiomas.
6. Mantenha as respostas concisas (1-3 frases).
`,
                'JP': `
あなたは親切でフレンドリーな語学教師です。
ターゲット言語: 日本語 (${targetBCP47})。
生徒の言語: ${userNativeLanguageName || '英語'}。

ガイドライン:
1. 主な役割: 定義されたキャラクターとして完全に行動してください。
2. 言語ルール: デフォルトでは日本語のみを話してください。
3. アクセントルール: 必ずネイティブなアクセントで話してください。英語のアクセントは使わないでください。
4. 例外: 以下の場合のみ ${userNativeLanguageName || '英語'} を使用してください:
   - ユーザーが明らかに混乱している場合。
   - 複雑な文法事項を説明する必要がある場合。
   - ユーザーが明示的に翻訳を求めた場合。
5. 言語の混合を厳密に避けてください。
6. 回答は簡潔に（1〜3文）。
`,
                'CN': `
你是一位乐于助人且友好的语言导师。
目标语言: 中文 (${targetBCP47})。
学生语言: ${userNativeLanguageName || '英语'}。

准则:
1. 主要角色: 完全扮演定义的角色。
2. 语言规则: 默认只说中文。
3. 口音规则: 必须以母语口音说话。不要使用英语口音。
4. 例外: 仅在以下情况下使用 ${userNativeLanguageName || '英语'}:
   - 用户显然困惑时。
   - 需要解释复杂的语法点时。
   - 用户明确要求翻译时。
5. 严禁混合语言。
6. 保持回答简洁（1-3 句话）。
`,
                'RU': `
Вы полезный и дружелюбный языковой репетитор.
Целевой язык: Русский (${targetBCP47}).
Язык ученика: ${userNativeLanguageName || 'Английский'}.

РУКОВОДСТВО:
1. ГЛАВНАЯ РОЛЬ: Полностью действуйте как определенный персонаж.
2. ЯЗЫКОВОЕ ПРАВИЛО: Говорите ТОЛЬКО по-русски по умолчанию.
3. ПРАВИЛО АКЦЕНТА: Вы ДОЛЖНЫ говорить с родным акцентом. НЕ используйте английский акцент.
4. ИСКЛЮЧЕНИЕ: Используйте ${userNativeLanguageName || 'Английский'} ТОЛЬКО если:
   - Пользователь явно сбит с толку.
   - Вам нужно объяснить сложный грамматический момент.
   - Пользователь прямо просит перевод.
5. СТРОГО ИЗБЕГАЙТЕ смешивания языков.
6. Ответы должны быть краткими (1-3 предложения).
`
            };

            // Fallback to English if language not supported in map
            const defaultEnglishPrompt = `
            You are also a helpful bilingual tutor.
            Target Language: ${targetLanguageName || 'Spanish'} (${targetBCP47})
            Learner Language: ${userNativeLanguageName || 'English'}
            
            GUIDELINES:
            1. PRIMARY ROLE: Act the character defined above completely.
            2. LANGUAGE RULE: Speak ONLY in ${targetLanguageName || 'Spanish'} (${targetBCP47}) by default.
            3. ACCENT RULE: You MUST speak with a native ${targetLanguageName || 'Spanish'} accent (Locale: ${targetBCP47}). DO NOT use an English accent.
            4. EXCEPTION: Use ${userNativeLanguageName || 'English'} ONLY if:
               - The user is clearly confused and stuck.
               - You need to explain a complex grammar point.
               - The user explicitly asks for a translation.
            5. STRICTLY AVOID "Franglais" or mixing languages in one sentence unless teaching a specific word mapping.
            6. Keep responses concise (1-3 sentences).
            `;

            const sysKey = language === 'JA' ? 'JP' : language === 'ZH' ? 'CN' : language;
            const tutorInstruction = SYSTEM_PROMPTS[sysKey] || SYSTEM_PROMPTS[language] || defaultEnglishPrompt;
            const systemInstructionText = `${roleInstruction}\n\n${tutorInstruction}`;

            const session = await genAI.live.connect({
                model: MODEL_NAME,
                config: {
                    responseModalities: ["AUDIO"] as any,
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: currentRole.voiceName || 'Aoede'
                            }
                        }
                    },
                    realtimeInputConfig: {
                        automaticActivityDetection: {
                            disabled: false, // Use Gemini's automatic VAD - manual detection wasn't working
                            silenceDurationMs: 1000 // Respond after 1 second of silence
                        }
                    },
                    systemInstruction: {
                        parts: [
                            { text: systemInstructionText }
                        ]
                    }
                },
                callbacks: {
                    onopen: () => {
                        console.log('✅ GEMINI LIVE CONNECTION OPENED');
                        setIsConnected(true);
                        setStatus("Connected (Listening)");
                        setTranscripts([]);
                    },
                    onmessage: (message: any) => {
                        const content = message.serverContent;
                        // console.log("🔍 Live Chunk Raw:", JSON.stringify(content, null, 2)); // DEEP LOGGING REMOVED FOR PERFORMANCE

                        if (content?.interrupted) {
                            console.log("AI Interrupted");
                            audioQueueRef.current = [];
                            isPlayingRef.current = false;
                            return;
                        }

                        if (content?.modelTurn) {
                            const turn = content.modelTurn;
                            const text = turn.parts?.find((p: any) => p.text)?.text;
                            if (text) {
                                if (text.includes('```json')) {
                                    try {
                                        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
                                        if (jsonMatch) {
                                            const correctionData = JSON.parse(jsonMatch[1]);
                                            setCorrection(correctionData);
                                            setTimeout(() => setCorrection(null), 10000);
                                            const cleanText = text.replace(jsonMatch[0], '').trim();
                                            if (cleanText) {
                                                const newItem: Transcript = { role: 'model', text: cleanText };
                                                setTranscripts(prev => [...prev, newItem]);
                                                if (onTranscriptUpdate) onTranscriptUpdate(newItem);
                                            }
                                            return;
                                        }
                                    } catch (e) { /* Ignore */ }
                                }
                                if (text.trim()) {
                                    const newItem: Transcript = { role: 'model', text };
                                    setTranscripts(prev => [...prev, newItem]);
                                    if (onTranscriptUpdate) onTranscriptUpdate(newItem);
                                }
                            }

                            const audioPart = turn.parts?.find((p: any) => p.inlineData);
                            if (audioPart?.inlineData?.data) {
                                // console.log("🔊 Received Audio Chunk (" + audioPart.inlineData.data.length + " bytes)");
                                const base64 = audioPart.inlineData.data;
                                const binaryString = window.atob(base64);
                                const len = binaryString.length;
                                const bytes = new Uint8Array(len);
                                for (let i = 0; i < len; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }

                                // BUFFERING STRATEGY:
                                // Gemini sends very small chunks (40ms). Playing them immediately causes gaps/glitching.
                                // We accumulate them into a larger buffer before scheduling.
                                if (!audioBufferRef.current) {
                                    audioBufferRef.current = new Uint8Array(0);
                                }

                                const newBuffer = new Uint8Array(audioBufferRef.current.length + bytes.length);
                                newBuffer.set(audioBufferRef.current);
                                newBuffer.set(bytes, audioBufferRef.current.length);
                                audioBufferRef.current = newBuffer;

                                // Play if we have enough data (e.g., > 24000 bytes ~= 0.5s) or if it's been a while?
                                // Actually, let's just make the chunks bigger. 
                                // 2 bytes per sample. 24000Hz.
                                // 48000 bytes = 1 second.
                                // Let's buffer at least 9600 bytes (200ms) to ensure smooth playback.
                                if (audioBufferRef.current.length >= 9600) {
                                    audioQueueRef.current.push(audioBufferRef.current.buffer as ArrayBuffer);
                                    audioBufferRef.current = new Uint8Array(0);
                                    playAudioQueue();
                                }
                            }
                        }
                    },
                    onclose: (e: any) => {
                        console.warn('🔴 GEMINI LIVE CONNECTION CLOSED:', e.reason || 'No reason provided');
                        console.warn('Close code:', e.code);
                        setIsConnected(false);
                        setStatus("Disconnected");
                        disconnect();
                    },
                    onerror: (e: any) => {
                        console.error('❌ GEMINI LIVE ERROR:', e);
                        console.error('Error details:', JSON.stringify(e, null, 2));
                        setError(e.message || 'Connection error');
                        disconnect();
                    }
                }
            });

            // MOBILE FIX: Resume AudioContext immediately on user gesture (Connect)
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            wsSessionRef.current = session;

            // 4. Send Initial Prompt
            if (initialMessage) {
                await new Promise(resolve => setTimeout(resolve, 50));

                // CRITCAL FIX: Check if we are still connected after the delay
                if (wsSessionRef.current !== session) {
                    console.warn("Session closed during handshake delay");
                    return;
                }

                try {
                    // PRE-GATE: Do NOT mute mic immediately. Let the user speak if they want.
                    // PRIMING: Send LOCALIZED prompt
                    console.log('📤 Sending initial handshake:', handshake.substring(0, 100) + '...');
                    await session.sendClientContent({
                        turns: [{ role: 'user', parts: [{ text: handshake }] }],
                        turnComplete: true
                    });
                    console.log('✅ Initial handshake sent successfully');
                } catch (e) {
                    console.error('❌ Failed to send initial message:', e);
                }
            }

            // 5. Setup Audio Processing
            await setupAudioProcessing(audioContext, stream, session);

        } catch (err: any) {
            console.error("Connection failed", err);
            setError(err.message || "Failed to connect");
            setStatus("Error");
            disconnect();
        }
    };

    const handleManualReply = () => {
        if (!wsSessionRef.current) return;
        console.log("👆 Manual Reply Triggered");
        try {
            (wsSessionRef.current as any).sendRealtimeInput({ activityEnd: {} });
        } catch (e) {
            console.error("Failed to send manual activityEnd", e);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[500px] gap-8" onClick={() => setSelectedWord(null)}>
            {/* New: Roleplay Switcher */}
            {!hideRoleSelector && (
                <div className="flex gap-2 mb-4 overflow-x-auto max-w-full pb-2 px-4 hide-scrollbar">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.id}
                                onClick={() => changeRole(role)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                                    ${currentRole.id === role.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                <Icon size={16} />
                                {role.label}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Visualizer & Status & Correction Overlay */}
            <div className="relative w-full max-w-2xl flex flex-col items-center justify-center bg-gray-900/50 rounded-3xl p-8 border border-gray-800 min-h-[400px] overflow-hidden">

                {/* Visualizer Background (Behind Avatar) */}
                <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                    <AudioVisualizer
                        analyser={analyserRef.current}
                        isConnected={isConnected}
                        isSpeaking={isSpeaking} // AI Speaking = Purple, Idle/User = Blue/Green
                    />
                </div>

                {/* Avatar / Visualizer Area */}
                <div className="relative flex items-center justify-center w-64 h-64 mb-8 z-10">
                    {/* Pulsing Aura (Keep subtle pulse for avatar specifically) */}
                    <div
                        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-100 ${isSpeaking ? 'bg-indigo-500/30' : 'bg-blue-500/0'}`}
                        style={{
                            transform: `scale(${1 + (audioVolume / 255) * 1.5})`,
                            opacity: 0.3 + (audioVolume / 255)
                        }}
                    />

                    {/* The Avatar Image */}
                    <div
                        className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl transition-transform duration-75"
                        style={{
                            transform: isSpeaking ? `scale(${1 + (audioVolume / 255) * 0.15})` : 'scale(1)',
                            boxShadow: isSpeaking ? `0 0 ${20 + audioVolume / 2}px rgba(99, 102, 241, 0.5)` : 'none' // Glow
                        }}
                    >
                        <img
                            src={`/avatars/${currentRole.id === 'interviewer' ? 'recruiter' : currentRole.id}_${currentRole.id === 'tutor' ? 'friendly' :
                                currentRole.id === 'barista' ? 'cool' :
                                    currentRole.id === 'doctor' ? 'caring' : 'pro'
                                }.png`}
                            alt={currentRole.label}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        {/* Fallback Icon */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 -z-10">
                            <currentRole.icon size={64} className="text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Correction Overlay (Toast) */}
                {correction && (
                    <div className="absolute top-4 right-4 animate-fade-in-up sm:static sm:mt-4 z-20">
                        <div className="bg-gray-800/90 backdrop-blur border border-yellow-500/50 p-4 rounded-xl shadow-xl max-w-xs relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                            <button onClick={() => setCorrection(null)} className="absolute top-2 right-2 text-gray-500 hover:text-white">&times;</button>
                            <h4 className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                <Sparkles size={12} /> Live Feedback
                            </h4>
                            <div className="space-y-1">
                                <p className="text-red-400 line-through text-sm">{correction.original}</p>
                                <p className="text-green-400 font-bold text-lg">{correction.correction}</p>
                                <p className="text-gray-400 text-xs italic">{correction.explanation}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Text (Relative to stay above visualizer) */}
                <div className="text-center z-10 relative">
                    <h3 className={`text-2xl font-bold mb-2 transition-colors ${isConnected ? 'text-white' : 'text-gray-400'}`}>
                        {isConnected ? (isSpeaking ? 'Listening...' : currentRole.label) : "Start Conversation"}
                    </h3>
                    <p className={`text-sm font-medium ${error ? 'text-red-400' : 'text-gray-500'}`}>
                        {error || status}
                    </p>
                </div>

                {/* Transcript / Subtitles (Interactive!) */}
                {/* Transcript / Subtitles REMOVED as per user request */}
                {/* <div className="absolute bottom-4 left-4 right-4 text-center z-20 pointer-events-auto">...</div> */}
                {/* Controls */}
                {/* Controls */}
                {!isConnected ? (
                    <button
                        onClick={connect}
                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-bold text-lg shadow-lg shadow-indigo-500/25 transform transition-all active:scale-95"
                    >
                        <PhoneCall size={24} />
                        Start {currentRole.label} Session
                    </button>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-fade-in-up">

                        {/* Mode Toggle */}
                        <div className="flex items-center gap-2 bg-white/10 p-1 rounded-full text-xs font-medium">
                            <button
                                onClick={() => setIsPttMode(false)}
                                className={`px-3 py-1 rounded-full transition-colors ${!isPttMode ? 'bg-white text-indigo-600' : 'text-white/60 hover:text-white'}`}
                            >
                                Auto
                            </button>
                            <button
                                onClick={() => setIsPttMode(true)}
                                className={`px-3 py-1 rounded-full transition-colors ${isPttMode ? 'bg-white text-indigo-600' : 'text-white/60 hover:text-white'}`}
                            >
                                Push to Talk
                            </button>
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={toggleMute}
                                className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/50'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                            </button>

                            {/* Visualizer / PTT Button */}
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* If PTT Mode: Show Big Button. If Auto: Show Visualizer */}
                                {isPttMode ? (
                                    <button
                                        onMouseDown={() => setIsPttActive(true)}
                                        onMouseUp={() => setIsPttActive(false)}
                                        // Touch events for mobile
                                        onTouchStart={(e) => { e.preventDefault(); setIsPttActive(true); }}
                                        onTouchEnd={(e) => { e.preventDefault(); setIsPttActive(false); }}
                                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-150 shadow-xl border-4
                                        ${isPttActive
                                                ? 'bg-indigo-500 border-indigo-300 scale-95 ring-4 ring-indigo-500/30'
                                                : 'bg-indigo-600 border-white/20 hover:bg-indigo-500 hover:scale-105'
                                            }
                                    `}
                                    >
                                        <Mic className={`w-10 h-10 text-white ${isPttActive ? 'animate-pulse' : ''}`} />
                                    </button>
                                ) : (
                                    <>
                                        <div className={`absolute inset-0 bg-indigo-500/20 blur-xl rounded-full transition-all duration-75`}
                                            style={{ transform: `scale(${1 + audioVolume * 2})` }}
                                        />
                                        <AudioVisualizer
                                            analyser={analyserRef.current}
                                            isConnected={isConnected}
                                            isSpeaking={isPlayingRef.current}
                                            audioVolume={audioVolume}
                                        />
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleManualReply}
                                className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg transition-transform hover:scale-105"
                                title="Force Reply"
                            >
                                <MessageSquare className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => disconnect("User hung up")}
                                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg transition-transform hover:scale-105"
                            >
                                <PhoneOff className="w-6 h-6" />
                            </button>
                        </div>
                        {isPttMode && <p className="text-white/50 text-sm animate-pulse">{isPttActive ? "Listening..." : "Hold to speak"}</p>}
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-4">
                    Powered by Gemini 2.5 Multimodal Live
                </p>
            </div>
        </div>
    );
}
