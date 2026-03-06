import { useState, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Loader2, Minimize2, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { askChatbot, parseFormFromText, ChatMessage, FormParseResult } from "@/lib/gemini";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useReports } from "@/api/reports";
import { getAiConsent, setAiConsent as persistConsent } from "@/lib/ai-utils";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const WELCOME = "Hi! I'm your ERP assistant 👋 Ask anything about your business, or describe a sale/purchase to fill a form automatically.";

// A message can carry an optional form action
interface ChatMessageWithAction extends ChatMessage {
    formAction?: FormParseResult & { resolvedItems: ResolvedItem[] };
}

interface ResolvedItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

const FORM_ROUTES: Record<string, string> = {
    sale: "/sell/direct",        // DirectSale.tsx — has location.state prefill support
    purchase: "/purchase/direct", // DirectPurchase.tsx — has location.state prefill support
    quotation: "/sales/quotations/add",
};

export function AiChatbot() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessageWithAction[]>([]);
    const [input, setInput] = useState("");
    const [hasConsent, setHasConsent] = useState(getAiConsent());
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load contacts & products eagerly (DashboardLayout is admin-only, so safe to pre-fetch).
    // This ensures data is in the React Query cache before the user sends their first message.
    // Reports are heavier — keep deferred until the chatbot is actually opened.
    const { data: contacts, isLoading: contactsLoading } = useContacts();
    const { data: products, isLoading: productsLoading } = useProducts();
    const { data: report } = useReports(undefined, { enabled: open });
    const dataReady = !contactsLoading && !productsLoading;

    const handleConsent = () => {
        persistConsent(true);
        setHasConsent(true);
    };

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Listen for external chatbot open event
    useEffect(() => {
        const handleOpenChatbot = () => setOpen(true);
        window.addEventListener('open-chatbot', handleOpenChatbot);
        return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
    }, []);

    // ── Build rich context for Q&A ──────────────────────────────────────────
    const buildContext = () => {
        const customers = contacts?.filter(c => c.role === "Customer" || c.role === "Both" || !c.role) ?? [];
        const suppliers = contacts?.filter(c => c.role === "Supplier" || c.role === "Both") ?? [];
        const allProducts = products ? [...products] : [];
        const lowStockItems = allProducts.filter(p => (p.current_stock ?? 0) <= (p.alert_quantity ?? 5));

        return {
            customers: customers.map(c => ({ name: c.name, phone: c.phone, email: c.email })),
            suppliers: suppliers.map(s => ({ name: s.name, phone: s.phone })),
            products: allProducts.map(p => ({
                name: p.name,
                current_stock: p.current_stock ?? 0,
                alert_quantity: p.alert_quantity ?? 5,
                sale_price: p.sale_price,
                purchase_price: p.purchase_price,
            })),
            low_stock_items: lowStockItems.map(p => ({
                name: p.name,
                current_stock: p.current_stock ?? 0,
                alert_quantity: p.alert_quantity ?? 5,
            })),
            financials: {
                total_revenue: report?.totalRevenue ?? 0,
                total_expenses: report?.totalExpenses ?? 0,
                gross_profit: report?.grossProfit ?? 0,
                net_profit: report?.netProfit ?? 0,
                cogs: report?.cogs ?? 0,
            },
            summary: {
                total_customers: customers.length,
                total_suppliers: suppliers.length,
                total_products: allProducts.length,
                low_stock_count: lowStockItems.length,
            },
        };
    };

    // ── Fuzzy-match a name against a list (Fuse.js) ────────────────────────
    const fuzzyFind = <T extends { name: string }>(name: string, list: T[]): T | undefined => {
        if (!name || !list.length) return undefined;
        const fuse = new Fuse(list, { keys: ["name"], threshold: 0.45, includeScore: true });
        const results = fuse.search(name);
        const best = results[0];
        return best && (best.score ?? 1) < 0.45 ? best.item : undefined;
    };

    // ── Resolve AI product names → actual product IDs ──────────────────────
    const resolveItems = (aiItems: { product_name: string; quantity: number; unit_price: number }[]): ResolvedItem[] => {
        return aiItems.map(ai => {
            const match = fuzzyFind(ai.product_name, products ?? []) as (typeof products)[0] | undefined;
            return {
                productId: match?.id ?? "",
                productName: match?.name ?? ai.product_name,
                quantity: ai.quantity || 1,
                unitPrice: ai.unit_price || match?.sale_price || 0,
            };
        });
    };

    // ── Handle Open Form button click ──────────────────────────────────────
    const openForm = (action: ChatMessageWithAction["formAction"]) => {
        if (!action || action.intent === "none") return;

        // Resolve contact ID
        const allContacts = contacts ?? [];
        const matchedContact = action.contact_name ? fuzzyFind(action.contact_name, allContacts) : undefined;

        const prefill = {
            contactId: matchedContact?.id ?? "",
            contactName: action.contact_name,
            items: action.resolvedItems,
        };

        navigate(FORM_ROUTES[action.intent], { state: { prefill } });
        setOpen(false);
    };

    // ── Main send logic ────────────────────────────────────────────────────
    const handleSend = async (overrideText?: string) => {
        const text = (overrideText ?? input).trim();
        if (!text || isLoading) return;
        if (!overrideText) setInput("");
        if (!hasConsent) return;

        const userMsg: ChatMessageWithAction = { role: "user", text };
        const newMessages: ChatMessageWithAction[] = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // 1. Try to detect form filling intent first
            const allContacts = contacts ?? [];
            const intentResult = await parseFormFromText(
                text,
                allContacts.map(c => ({ name: c.name }))
            );

            if (intentResult.intent !== "none") {
                // Form intent detected — resolve items and show action bubble
                const resolvedItems = resolveItems(intentResult.items);
                const modelMsg: ChatMessageWithAction = {
                    role: "model",
                    text: intentResult.message,
                    formAction: { ...intentResult, resolvedItems },
                };
                setMessages([...newMessages, modelMsg]);
            } else {
                // Regular Q&A
                const reply = await askChatbot(
                    newMessages.map(m => ({ role: m.role, text: m.text })),
                    buildContext()
                );
                setMessages([...newMessages, { role: "model", text: reply }]);
            }
        } catch (err: any) {
            setMessages([...newMessages, {
                role: "model",
                text: `⚠️ Sorry, I hit an error: ${err?.message || "Unknown error"}. Please try again.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating toggle button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
                    title="Ask AI"
                >
                    <Bot className="h-6 w-6" />
                </button>
            )}

            {/* Chat window */}
            {open && (
                <div className={cn(
                    "fixed bottom-6 right-6 z-[60] flex flex-col bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 transition-all duration-200",
                    minimized ? "w-72 h-14" : "w-[380px] h-[540px]"
                )}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                            <span className="text-sm font-semibold text-primary-foreground">ERP Assistant</span>
                            <span className="text-[10px] bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full">AI</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setMinimized(v => !v)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1">
                                {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            </button>
                            <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {!minimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {/* Welcome */}
                                <div className="flex gap-2 items-start">
                                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]">{WELCOME}</div>
                                </div>

                                {/* Conversation */}
                                {messages.map((msg, i) => (
                                    <div key={i} className={cn("flex gap-2 items-start", msg.role === "user" ? "flex-row-reverse" : "")}>
                                        {msg.role === "model" && (
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div className="flex flex-col gap-2 max-w-[85%]">
                                            <div className={cn(
                                                "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-muted rounded-tl-sm border border-border/50"
                                            )}>
                                                {msg.text}
                                            </div>

                                            {/* Form action button */}
                                            {msg.formAction && msg.formAction.intent !== "none" && (
                                                <button
                                                    onClick={() => openForm(msg.formAction)}
                                                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] text-left shadow-sm"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                                    <span>
                                                        Open {msg.formAction.intent.charAt(0).toUpperCase() + msg.formAction.intent.slice(1)} Form →
                                                        {msg.formAction.resolvedItems.length > 0 &&
                                                            ` (${msg.formAction.resolvedItems.length} item${msg.formAction.resolvedItems.length > 1 ? "s" : ""} pre-filled)`
                                                        }
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Loading */}
                                {isLoading && (
                                    <div className="flex gap-2 items-start">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Consent Check or Suggested prompts */}
                            {!hasConsent ? (
                                <div className="mx-4 mb-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/30 flex flex-col gap-3">
                                    <div className="flex gap-2 items-start">
                                        <ShieldAlert className="h-4 w-4 text-primary dark:text-primary shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-primary dark:text-primary">AI Privacy Consent</p>
                                            <p className="text-[10px] leading-normal text-primary/80 dark:text-primary/70">
                                                This assistant uses Google Gemini to help you manage your ERP.
                                                By continuing, you agree to share sanitized business data for processing.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleConsent}
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-8 text-xs font-bold"
                                    >
                                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                                        Accept & Start Chatting
                                    </Button>
                                </div>
                            ) : messages.length === 0 && (
                                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                                    {[
                                        "What's my net profit?",
                                        "Which items are low on stock?",
                                        "Sale to Taj Glass, 5 F Brackets",
                                        "Purchase from AMS, 10 Mirror Caps",
                                    ].map(q => (
                                        <button
                                            key={q}
                                            onClick={() => handleSend(q)}
                                            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2.5 py-1 rounded-full transition-colors font-medium border border-border/50"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-3 border-t flex gap-2">
                                <Input
                                    ref={inputRef}
                                    placeholder={
                                        !hasConsent ? "Please accept consent to chat" :
                                            !dataReady ? "Loading your ERP data..." :
                                                "Ask or describe a sale/purchase..."
                                    }
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    className="flex-1 rounded-full text-sm h-9"
                                    disabled={isLoading || !hasConsent || !dataReady}
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9 rounded-full shrink-0"
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim() || !hasConsent || !dataReady}
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
