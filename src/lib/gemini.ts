import { supabase } from "@/lib/supabase";
import { getAiConsent } from "./ai-utils";

// ── Types (unchanged — no impact on callers) ────────────────────────────────

export interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
}

export interface ParsedOrder {
    contact_name: string | null;
    items: OrderItem[];
}

export interface ChatMessage {
    role: "user" | "model";
    text: string;
}

// ── Helper ──────────────────────────────────────────────────────────────────

async function invoke<T = unknown>(type: string, payload: object): Promise<T> {
    const { data, error } = await supabase.functions.invoke("gemini", {
        body: { type, payload },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data as T;
}

// ── Public API (same signatures as before) ──────────────────────────────────

/** Parse a purchase invoice image — returns supplier_name + items */
export async function parseInvoiceImage(
    base64Image: string,
    mimeType: string
): Promise<ParsedOrder & { supplier_name: string | null }> {
    const parsed = await invoke<any>("invoice", { base64Image, mimeType });
    return {
        ...parsed,
        supplier_name: parsed.supplier_name ?? parsed.contact_name ?? null
    };
}

/** Parse a customer PO / sales order image — returns customer_name + items */
export async function parseSaleOrderImage(
    base64Image: string,
    mimeType: string
): Promise<ParsedOrder & { customer_name: string | null }> {
    const parsed = await invoke<any>("sale", { base64Image, mimeType });
    return {
        ...parsed,
        customer_name: parsed.customer_name ?? parsed.contact_name ?? null
    };
}

/** Analyze any report data and return plain-English business insights */
export async function analyzeReport(reportType: string, data: object): Promise<string> {
    if (!getAiConsent()) throw new Error("AI processing consent not granted.");
    const result = await invoke<{ insights: string }>("report", { reportType, data });
    return result.insights;
}

/** ERP Chatbot — answers questions using provided live ERP context */
export async function askChatbot(messages: ChatMessage[], context: object): Promise<string> {
    if (!getAiConsent()) throw new Error("AI processing consent not granted.");
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error("askChatbot requires at least one message");
    }
    const result = await invoke<{ reply: string }>("chat", { messages, context });
    return result.reply;
}

// ── Conversational Form Filling ─────────────────────────────────────────────

export type FormIntent = "sale" | "purchase" | "quotation" | "none";

export interface FormParseResult {
    intent: FormIntent;
    contact_name: string | null;
    items: { product_name: string; quantity: number; unit_price: number }[];
    message: string;
}

/** Parse a natural-language message into structured form data */
export async function parseFormFromText(
    text: string,
    products: { name: string }[],
    contacts: { name: string }[]
): Promise<FormParseResult> {
    return invoke("parse_form", { text, products, contacts });
}
