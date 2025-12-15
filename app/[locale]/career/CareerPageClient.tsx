'use client';

import { useState, useEffect } from 'react';
import { analyzeCareerDocs, generateInterviewHint } from './actions';
import LiveCoachClient, { Transcript } from '@/components/LiveCoachClient';
import { Briefcase, FileText, Sparkles, Upload, Lightbulb, HelpCircle, History, Trash2, ArrowRight } from 'lucide-react';

interface CareerPageProps {
    userNativeLanguageName: string;
    apiKey: string;
}

interface HistoryItem {
    id: string;
    date: number;
    type: string;
    jobPreview: string;
    briefing: string;
}

export default function CareerPage({ userNativeLanguageName, apiKey }: CareerPageProps) {
    const [step, setStep] = useState<'SETUP' | 'ANALYZING' | 'LIVE'>('SETUP');
    const [briefing, setBriefing] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Live Assist State
    const [lastQuestion, setLastQuestion] = useState<string>('');
    const [hint, setHint] = useState<any>(null);
    const [isGeneratingHint, setIsGeneratingHint] = useState(false);

    // History State
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('career_history');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const saveToHistory = (newBriefing: string, type: string, jobDesc: string) => {
        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            date: Date.now(),
            type,
            jobPreview: jobDesc.slice(0, 50) + (jobDesc.length > 50 ? '...' : '') || 'No Job Description',
            briefing: newBriefing
        };
        const newHistory = [newItem, ...history].slice(0, 5); // Keep last 5
        setHistory(newHistory);
        localStorage.setItem('career_history', JSON.stringify(newHistory));
    };

    const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);
        localStorage.setItem('career_history', JSON.stringify(newHistory));
    };

    const loadSession = (item: HistoryItem) => {
        setBriefing(item.briefing);
        setStep('LIVE');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStep('ANALYZING');
        setError('');

        const formData = new FormData(e.currentTarget);
        const jobDesc = formData.get('jobDescription') as string || '';
        const type = formData.get('type') as string || 'HR';

        try {
            const result = await analyzeCareerDocs(formData);
            if (result.success && result.briefing) {
                setBriefing(result.briefing);
                saveToHistory(result.briefing, type, jobDesc);
                setStep('LIVE');
            } else {
                setError(result.error || "Analysis failed.");
                setStep('SETUP');
            }
        } catch (err) {
            setError("Communication error.");
            setStep('SETUP');
        }
    };

    const handleTranscriptUpdate = (t: Transcript) => {
        if (t.role === 'model') {
            setLastQuestion(t.text);
            // Reset hint when new question comes
            setHint(null);
        }
    };

    const requestHint = async () => {
        if (!lastQuestion) return;
        setIsGeneratingHint(true);
        const result = await generateInterviewHint(lastQuestion, { briefing });
        if (result.success) {
            setHint(result.hint);
        }
        setIsGeneratingHint(false);
    };

    if (step === 'LIVE') {
        return (
            <div className="min-h-screen bg-black text-white p-4 flex gap-4">
                <div className="flex-1 flex flex-col">
                    <header className="mb-4 flex items-center gap-2 text-gray-400 max-w-4xl mx-auto w-full">
                        <Briefcase size={20} />
                        <span className="font-bold">Career Mode</span>
                        <span className="text-gray-600">|</span>
                        <button onClick={() => setStep('SETUP')} className="hover:text-white underline text-sm">
                            End Interview
                        </button>
                    </header>

                    <LiveCoachClient
                        apiKey={apiKey}
                        language="EN"
                        targetLanguageName="Professional English"
                        userNativeLanguageName={userNativeLanguageName}
                        initialMessage="Hello candidate, I have reviewed your CV. Let's start."
                        customSystemInstruction={briefing}
                        hideRoleSelector={true}
                        onTranscriptUpdate={handleTranscriptUpdate}
                    />
                </div>

                {/* Live Assistant Panel */}
                <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 rounded-xl flex flex-col gap-4 h-[calc(100vh-2rem)] sticky top-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-gray-800 pb-2">
                        <Sparkles size={18} />
                        <span>Live Assistant</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        <div className="bg-gray-800/50 p-3 rounded-lg text-sm text-gray-300">
                            <strong>Last Question:</strong>
                            <p className="italic mt-1 text-white">{lastQuestion || "Waiting for interviewer..."}</p>
                        </div>

                        {hint && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
                                    <strong className="text-green-400 text-xs uppercase tracking-wider block mb-2">Key Points</strong>
                                    <ul className="list-disc list-inside text-sm text-gray-200 space-y-1">
                                        {hint.keyPoints?.map((p: string, i: number) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                                    <strong className="text-blue-400 text-xs uppercase tracking-wider block mb-2">Suggested Opening</strong>
                                    <p className="text-sm text-gray-200">"{hint.exampleOpening}"</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={requestHint}
                        disabled={!lastQuestion || isGeneratingHint}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
                    >
                        {isGeneratingHint ? (
                            <Sparkles className="animate-spin" size={20} />
                        ) : (
                            <Lightbulb size={20} />
                        )}
                        {hint ? "Regenerate Hint" : "Get Suggested Answer"}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                        Use this to learn, not just to read!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/20">
                        <Briefcase size={32} />
                    </div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Interview Simulator
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Upload your CV and let our AI Recruiter challenge you.
                    </p>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-gray-800 bg-gray-900/50 backdrop-blur-xl">
                    {step === 'ANALYZING' ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={20} className="text-blue-400 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-xl font-medium animate-pulse">Analyzing your profile...</p>
                            <p className="text-sm text-gray-500">Reading CV • Generating Questions • Preparing Scenario</p>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 font-bold text-gray-300">
                                        <Upload size={18} /> Upload CV (PDF)
                                    </label>
                                    <input
                                        type="file"
                                        name="cv"
                                        accept=".pdf"
                                        required
                                        className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500/20 file:text-blue-400 file:font-semibold hover:file:bg-blue-500/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 font-bold text-gray-300">
                                        <FileText size={18} /> Job Description (Optional)
                                    </label>
                                    <textarea
                                        name="jobDescription"
                                        placeholder="Paste the job description here for a tailored interview..."
                                        className="w-full h-32 p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none text-gray-300"
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 font-bold text-gray-300">
                                        Interview Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="cursor-pointer">
                                            <input type="radio" name="type" value="HR" defaultChecked className="peer sr-only" />
                                            <div className="p-4 rounded-xl border border-gray-700 bg-gray-800 peer-checked:bg-blue-500/20 peer-checked:border-blue-500 transition text-center font-bold text-gray-400 peer-checked:text-blue-400">
                                                👔 HR / Soft Skills
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name="type" value="TECHNICAL" className="peer sr-only" />
                                            <div className="p-4 rounded-xl border border-gray-700 bg-gray-800 peer-checked:bg-purple-500/20 peer-checked:border-purple-500 transition text-center font-bold text-gray-400 peer-checked:text-purple-400">
                                                💻 Technical
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition transform hover:scale-[1.02]"
                                >
                                    Start Simulation
                                </button>
                            </form>

                            {/* HISTORY LIST */}
                            {history.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-800 animate-in fade-in">
                                    <h3 className="text-gray-400 font-bold mb-4 flex items-center gap-2">
                                        <History size={16} /> Recent Sessions
                                    </h3>
                                    <div className="space-y-3">
                                        {history.map(item => (
                                            <div key={item.id} onClick={() => loadSession(item)} className="group cursor-pointer p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'TECHNICAL' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'} font-bold`}>
                                                            {item.type}
                                                        </span>
                                                        <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 font-medium truncate w-full">
                                                        {item.jobPreview}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-2 text-gray-500 hover:text-red-400 transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="p-2 text-blue-400">
                                                        <ArrowRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
