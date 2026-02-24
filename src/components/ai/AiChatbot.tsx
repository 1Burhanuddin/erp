import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { askChatbot, ChatMessage } from "@/lib/gemini";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useReports } from "@/api/reports";

const WELCOME = "Hi! I'm your ERP assistant 👋 Ask me anything about your sales, inventory, customers, or reports.";

export function AiChatbot() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Pull live ERP data for context
    const { data: contacts } = useContacts();
    const { data: products } = useProducts();
    const { data: report } = useReports(undefined);

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const buildContext = () => {
        const customers = contacts?.filter(c => c.role === "Customer" || c.role === "Both" || !c.role) ?? [];
        const suppliers = contacts?.filter(c => c.role === "Supplier" || c.role === "Both") ?? [];
        const allProducts = products ?? [];
        const lowStockItems = allProducts.filter(p => (p.current_stock ?? 0) <= (p.min_stock_level ?? 5));

        return {
            customers: customers.map(c => ({ name: c.name, phone: c.phone, email: c.email })),
            suppliers: suppliers.map(s => ({ name: s.name, phone: s.phone })),
            products: allProducts.map(p => ({
                name: p.name,
                current_stock: p.current_stock ?? 0,
                min_stock_level: p.min_stock_level ?? 5,
                sale_price: p.sale_price,
                purchase_price: p.purchase_price,
            })),
            low_stock_items: lowStockItems.map(p => ({
                name: p.name,
                current_stock: p.current_stock ?? 0,
                min_stock_level: p.min_stock_level ?? 5,
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

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;
        setInput("");

        const userMsg: ChatMessage = { role: "user", text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const reply = await askChatbot(newMessages, buildContext());
            setMessages([...newMessages, { role: "model", text: reply }]);
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
                    className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
                    title="Ask AI"
                >
                    <Bot className="h-6 w-6" />
                </button>
            )}

            {/* Chat window */}
            {open && (
                <div className={cn(
                    "fixed bottom-6 right-6 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 transition-all duration-200",
                    minimized ? "w-72 h-14" : "w-[360px] h-[520px]"
                )}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-primary rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary-foreground" />
                            <span className="text-sm font-semibold text-primary-foreground">ERP Assistant</span>
                            <span className="text-[10px] bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full">AI</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMinimized(v => !v)}
                                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
                            >
                                {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
                            >
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
                                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]">
                                        {WELCOME}
                                    </div>
                                </div>

                                {/* Conversation */}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={cn("flex gap-2 items-start", msg.role === "user" ? "flex-row-reverse" : "")}
                                    >
                                        {msg.role === "model" && (
                                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "rounded-2xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                : "bg-muted rounded-tl-sm"
                                        )}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator */}
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

                            {/* Suggested questions (only when empty) */}
                            {messages.length === 0 && (
                                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                                    {[
                                        "What's my net profit?",
                                        "How many products are low on stock?",
                                        "How many customers do I have?",
                                    ].map(q => (
                                        <button
                                            key={q}
                                            onClick={() => { setInput(q); }}
                                            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2.5 py-1 rounded-full transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="p-3 border-t flex gap-2">
                                <Input
                                    placeholder="Ask about your business..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    className="flex-1 rounded-full text-sm h-9"
                                    disabled={isLoading}
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9 rounded-full shrink-0"
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
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
