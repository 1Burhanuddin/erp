/**
 * Sanitizes and summarizing data before sending to AI models.
 * Replaces sensitive info with placeholders or aggregates.
 */

export function sanitizeContactName(name: string): string {
    if (!name) return "Contact";
    // Keep first name or first letter for context but obscure the rest if needed
    // For now, we'll just trim and mask if it's very specific
    const parts = name.trim().split(" ");
    if (parts.length > 1) return `${parts[0]} ${parts[1][0]}.`;
    return name;
}

export function sanitizeEmail(email: string): string {
    if (!email) return "";
    return "[Email Redacted]";
}

export function sanitizeAmount(amount: number): string {
    // Convert exact amounts to ranges or approximate strings to reduce precision leak
    if (amount < 1000) return "under ₹1k";
    if (amount < 10000) return "₹1k-₹10k";
    if (amount < 50000) return "₹10k-₹50k";
    if (amount < 100000) return "₹50k-₹1L";
    return "over ₹1L";
}

/** Summarizes stock data to avoid sending thousands of rows */
export function summarizeStock(products: any[]) {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.purchase_price || 0), 0);
    const lowStock = products.filter(p => p.current_stock <= (p.alert_quantity || 5)).length;

    // Top 10 products by value
    const topByValue = [...products]
        .sort((a, b) => (b.current_stock * b.purchase_price) - (a.current_stock * a.purchase_price))
        .slice(0, 10)
        .map(p => ({ name: p.name, stock: p.current_stock }));

    return {
        total_items: totalItems,
        total_inventory_value: totalValue,
        low_stock_count: lowStock,
        top_items_by_value: topByValue
    };
}

/** Summarizes expenses by category */
export function summarizeExpenses(expenses: any[]) {
    const byCategory = expenses.reduce((acc: any, e) => {
        const cat = e.expense_categories?.name || "Uncategorized";
        acc[cat] = (acc[cat] || 0) + (e.amount || 0);
        return acc;
    }, {});

    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
        total_period_expenses: total,
        breakdown: byCategory,
        transaction_count: expenses.length
    };
}

/** Check if user has consented to AI processing */
export function getAiConsent(): boolean {
    return localStorage.getItem("ai_consent") === "true";
}

export function setAiConsent(consent: boolean): void {
    localStorage.setItem("ai_consent", String(consent));
}
