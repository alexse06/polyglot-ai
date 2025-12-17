'use client';

import { useState, useEffect } from 'react';
import { analyzeCareerDocs, generateInterviewHint } from './actions';
import LiveCoachClient, { Transcript } from '@/components/LiveCoachClient';
import { Briefcase, FileText, Sparkles, Upload, Lightbulb, HelpCircle, History, Trash2, ArrowRight, X, Cpu, Scan, Globe } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { useRouter } from '@/navigation';

interface CareerPageProps {
    userNativeLanguageName: string;
    userTargetLanguage: string;
    apiKey: string;
}

interface HistoryItem {
    id: string;
    date: number;
    type: string;
    jobPreview: string;
    briefing: string;
}

export default function CareerPage({ userNativeLanguageName, userTargetLanguage, apiKey }: CareerPageProps) {
    const router = useRouter();
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
        formData.append('targetLanguage', userTargetLanguage);
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
            <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative overflow-hidden">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

                {/* Main Visualizer Area */}
                <div className="flex-1 flex flex-col relative z-10">
                    <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-50">
                        <div className="flex items-center gap-3 backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="font-mono text-xs text-red-400 tracking-widest uppercase">Live Simulation</span>
                        </div>

                        <button
                            onClick={() => setStep('SETUP')}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition border border-red-500/30 backdrop-blur-md flex items-center gap-2"
                        >
                            <X size={14} /> End Session
                        </button>
                    </header>

                    <LiveCoachClient
                        apiKey={apiKey}
                        targetLang={userTargetLanguage}
                        customSystemInstruction={briefing}
                        hideRoleSelector={true}
                        onTranscriptUpdate={handleTranscriptUpdate}
                    />
                </div>

                {/* HUD Sidebar */}
                <div className="w-full md:w-96 bg-gray-950/80 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[50vh] md:h-screen sticky bottom-0 md:top-0 transition-all z-20">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-2">
                            <Cpu className="text-blue-400" size={20} />
                            <h3 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Interview Assistant</h3>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-300 font-mono">
                            v2.5
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Live Transcript Analysis */}
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Scan size={12} /> Live Analysis
                            </div>
                            <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                                <p className="text-gray-400 text-sm italic min-h-[60px] relative z-10 transition-colors group-hover:text-gray-300">
                                    {lastQuestion ? `"${lastQuestion}"` : "Waiting for the interviewer to speak..."}
                                </p>
                                {!lastQuestion && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <div className="w-full h-[1px] bg-blue-500 animate-scan"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hints Area */}
                        {hint && (
                            <div className="space-y-4 animate-in slide-in-from-right-10 fade-in duration-500">
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-2">
                                        <Lightbulb size={12} /> Key Talking Points
                                    </div>
                                    <ul className="space-y-2">
                                        {hint.keyPoints?.map((p: string, i: number) => (
                                            <li key={i} className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg text-sm text-gray-300 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-blue-500 uppercase tracking-wider">Suggested Opening</div>
                                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-blue-200">
                                        "{hint.exampleOpening}"
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <button
                            onClick={requestHint}
                            disabled={!lastQuestion || isGeneratingHint}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            {isGeneratingHint ? (
                                <Sparkles className="animate-spin" size={20} />
                            ) : (
                                <Sparkles size={20} className="group-hover:animate-pulse" />
                            )}
                            <span className="relative z-10">{hint ? "Regenerate Analysis" : "Analyze & Suggest Answer"}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none"></div>

            <Link href="/dashboard" className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center gap-2 z-20 transition">
                <ArrowRight className="rotate-180" size={18} /> Back to Dashboard
            </Link>

            <div className="max-w-3xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-gray-800 to-black border border-white/10 mb-2 shadow-2xl relative group">
                        <div className="absolute inset-0 rounded-[2rem] bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <Briefcase size={40} className="text-indigo-400 relative z-10" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-indigo-400 mb-2">
                            Interview Simulator
                        </h1>
                        <p className="text-gray-400 text-lg">
                            AI-Powered Assessment & Coaching
                        </p>
                    </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">

                    {step === 'ANALYZING' ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu size={32} className="text-blue-400/80 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-2xl font-bold text-white animate-pulse">Analyzing Profile...</p>
                                <p className="text-base text-gray-500 font-mono">Parsing CV • Generating Context • Warming up AI Model</p>
                            </div>

                            {/* Scanning Effect */}
                            <div className="w-full max-w-sm h-1 bg-gray-800 rounded-full overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full w-1/3 bg-blue-500 blur-[4px] animate-[slide_1.5s_ease-in-out_infinite]"></div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-gray-300 text-sm uppercase tracking-wider">
                                        <Upload size={16} /> Upload CV (PDF)
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                        <input
                                            type="file"
                                            name="cv"
                                            accept=".pdf"
                                            required
                                            className="relative z-10 w-full p-4 rounded-xl bg-black/50 border border-white/10 hover:border-blue-500/50 focus:border-blue-500 transition text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-500 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-gray-300 text-sm uppercase tracking-wider">
                                        <FileText size={16} /> Job Description (Optional)
                                    </label>
                                    <textarea
                                        name="jobDescription"
                                        placeholder="Paste the job description here for a tailored interview..."
                                        className="w-full h-32 p-4 rounded-xl bg-black/50 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none text-gray-300 outline-none hover:border-white/20"
                                    ></textarea>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 font-bold text-gray-300 text-sm uppercase tracking-wider">
                                        Simulation Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="cursor-pointer group relative">
                                            <input type="radio" name="type" value="HR" defaultChecked className="peer sr-only" />
                                            <div className="p-5 rounded-2xl border border-white/10 bg-black/40 peer-checked:bg-blue-600/10 peer-checked:border-blue-500 transition text-center font-bold text-gray-400 peer-checked:text-blue-400 hover:border-white/20 hover:bg-white/5">
                                                <div className="mb-2 flex justify-center"><Globe className="w-6 h-6 peer-checked:animate-bounce" /></div>
                                                <span className="block text-sm">HR & Soft Skills</span>
                                            </div>
                                            <div className="absolute inset-0 border-2 border-blue-500 rounded-2xl opacity-0 peer-checked:opacity-10 pointer-events-none"></div>
                                        </label>
                                        <label className="cursor-pointer group relative">
                                            <input type="radio" name="type" value="TECHNICAL" className="peer sr-only" />
                                            <div className="p-5 rounded-2xl border border-white/10 bg-black/40 peer-checked:bg-purple-600/10 peer-checked:border-purple-500 transition text-center font-bold text-gray-400 peer-checked:text-purple-400 hover:border-white/20 hover:bg-white/5">
                                                <div className="mb-2 flex justify-center"><Cpu className="w-6 h-6 peer-checked:animate-spin" /></div>
                                                <span className="block text-sm">Technical Screening</span>
                                            </div>
                                            <div className="absolute inset-0 border-2 border-purple-500 rounded-2xl opacity-0 peer-checked:opacity-10 pointer-events-none"></div>
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-lg shadow-xl shadow-white/5 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    Start Simulation <ArrowRight size={20} />
                                </button>
                            </form>

                            {/* HISTORY LIST */}
                            {history.length > 0 && (
                                <div className="mt-10 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-5">
                                    <h3 className="text-gray-500 font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
                                        <History size={14} /> Recent Log
                                    </h3>
                                    <div className="space-y-3">
                                        {history.map(item => (
                                            <div key={item.id} onClick={() => loadSession(item)} className="group cursor-pointer p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/50 hover:bg-white/5 transition flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={twMerge(
                                                            "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                                                            item.type === 'TECHNICAL' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        )}>
                                                            {item.type}
                                                        </span>
                                                        <span className="text-xs text-gray-600 font-mono">{new Date(item.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 font-medium truncate w-full group-hover:text-white transition">
                                                        {item.jobPreview}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                                    <button onClick={(e) => deleteHistoryItem(item.id, e)} className="p-2 text-gray-600 hover:text-red-400 transition hover:bg-red-500/10 rounded-full">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="p-2 text-white bg-white/10 rounded-full">
                                                        <ArrowRight size={16} />
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
