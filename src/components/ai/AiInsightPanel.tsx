import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert } from "lucide-react";
import { analyzeReport } from "@/lib/gemini";
import { getAiConsent, setAiConsent as persistConsent } from "@/lib/ai-utils";
import { cn } from "@/lib/utils";

interface AiInsightPanelProps {
    reportType: string;
    data: object | null | undefined;
    className?: string;
}

export function AiInsightPanel({ reportType, data, className }: AiInsightPanelProps) {
    const [insights, setInsights] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [hasConsent, setHasConsent] = useState(getAiConsent());

    const handleConsent = () => {
        persistConsent(true);
        setHasConsent(true);
    };

    const handleAnalyze = async () => {
        if (!data) return;
        setIsLoading(true);
        setInsights(null);
        try {
            const result = await analyzeReport(reportType, data);
            setInsights(result);
        } catch (err: any) {
            setInsights(`⚠️ Could not generate insights: ${err?.message || "Unknown error"}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("border rounded-xl bg-gradient-to-br from-violet-50/60 to-indigo-50/40 dark:from-violet-950/20 dark:to-indigo-950/10 border-violet-200 dark:border-violet-800/50", className)}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Insights</p>
                        <p className="text-xs text-violet-600/70 dark:text-violet-400/70">Powered by Gemini</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAnalyze}
                        disabled={isLoading || !data || !hasConsent}
                        className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/50 h-8 text-xs font-semibold"
                    >
                        {isLoading
                            ? <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</>
                            : <><Sparkles className="h-3 w-3" /> {insights ? "Re-analyze" : "Analyze"}</>
                        }
                    </Button>
                    {insights && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600" onClick={() => setIsOpen(v => !v)}>
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </div>

            {insights && isOpen && (
                <div className="px-4 pb-4">
                    <div className="bg-white/70 dark:bg-black/20 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 space-y-2 border border-violet-100/50 dark:border-violet-900/30">
                        {insights.split("\n").filter(l => l.trim()).map((line, i) => (
                            <p key={i} className="leading-relaxed flex gap-2">
                                <span>{line}</span>
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {!hasConsent && (
                <div className="mx-4 mb-4 p-3 bg-violet-100/50 dark:bg-violet-950/40 rounded-xl border border-violet-200 dark:border-violet-800 flex flex-col gap-3">
                    <div className="flex gap-2 items-start">
                        <ShieldAlert className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-violet-900 dark:text-violet-200">AI Data Privacy</p>
                            <p className="text-[10px] leading-normal text-violet-700/80 dark:text-violet-400/80">
                                This feature sends a sanitized summary of this report to Google Gemini to generate insights.
                                No PII (names/emails) or specific customer identifiers are sent.
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleConsent}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg h-8 text-xs font-bold"
                    >
                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                        I Consent, Show Insights
                    </Button>
                </div>
            )}

            {hasConsent && !insights && !isLoading && (
                <p className="px-4 pb-4 text-xs text-violet-500/70 dark:text-violet-400/50">
                    Click "Analyze" to get AI-powered insights on this report.
                </p>
            )}
        </div>
    );
}
