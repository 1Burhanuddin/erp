import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}`;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── helpers ────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

function jsonErr(msg: string, status = 500) {
    return json({ error: msg }, status);
}

async function geminiContent(body: unknown): Promise<string> {
    const res = await fetch(`${GEMINI_BASE}:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? "Gemini API error");
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ── prompt builders ────────────────────────────────────────────────────────

function orderPrompt(contactLabel: string) {
    return `You are an order/invoice parser. Analyze this image and extract the following as valid JSON only, no markdown:
{
  "${contactLabel}": "<company or person name, or null>",
  "items": [
    {
      "product_name": "<product or item name>",
      "quantity": <number>,
      "unit_price": <number, per-unit price, no currency symbol>
    }
  ]
}
Rules:
- Extract ALL line items.
- unit_price is per-unit cost, NOT the total.
- Use null for missing strings, 0 for missing numbers.
- Respond with ONLY the JSON, no other text.`;
}

function parseResponseJson(text: string): unknown {
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    try {
        return JSON.parse(clean);
    } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Could not parse Gemini response as JSON");
    }
}

// ── main handler ───────────────────────────────────────────────────────────

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return jsonErr("Method not allowed", 405);

    if (!GEMINI_API_KEY) return jsonErr("GEMINI_API_KEY secret not set on server", 500);

    try {
        const { type, payload } = await req.json();

        // ── Invoice image parsing (purchase) ─────────────────────────────────
        if (type === "invoice") {
            const { base64Image, mimeType } = payload;
            const text = await geminiContent({
                contents: [{
                    parts: [
                        { text: orderPrompt("supplier_name") },
                        { inline_data: { mime_type: mimeType, data: base64Image } },
                    ],
                }],
                generationConfig: { temperature: 0.1 },
            });
            const parsed = parseResponseJson(text) as Record<string, unknown>;
            return json({ ...parsed, supplier_name: parsed.contact_name ?? parsed.supplier_name ?? null });
        }

        // ── Sale order image parsing ──────────────────────────────────────────
        if (type === "sale") {
            const { base64Image, mimeType } = payload;
            const text = await geminiContent({
                contents: [{
                    parts: [
                        { text: orderPrompt("customer_name") },
                        { inline_data: { mime_type: mimeType, data: base64Image } },
                    ],
                }],
                generationConfig: { temperature: 0.1 },
            });
            const parsed = parseResponseJson(text) as Record<string, unknown>;
            return json({ ...parsed, customer_name: parsed.contact_name ?? parsed.customer_name ?? null });
        }

        // ── Report analysis ───────────────────────────────────────────────────
        if (type === "report") {
            const { reportType, data } = payload;
            const prompt = `You are a smart business analyst for an ERP system. Analyze the following ${reportType} report data and provide 4-6 concise, actionable bullet-point insights.

Report Data:
${JSON.stringify(data, null, 2)}

Guidelines:
- Use plain English, no jargon
- Highlight key trends, risks, and opportunities
- Be specific with numbers where available
- Format each insight as a bullet starting with an emoji (📈 📉 ⚠️ ✅ 💡 🔴)
- Keep each bullet to 1-2 lines max
- Do NOT include headers or titles, just the bullets`;

            const text = await geminiContent({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4 },
            });
            return json({ insights: text.trim() });
        }

        // ── Chatbot ───────────────────────────────────────────────────────────
        if (type === "chat") {
            const { messages, context } = payload; // messages: [{role, text}], context: object

            const contextText = `You are an AI assistant built into an ERP system. You help business owners understand their data.
You have access to the following live ERP data as context:
${JSON.stringify(context, null, 2)}

Guidelines:
- Answer questions about sales, purchases, inventory, expenses, customers, and suppliers using the data above.
- Be concise and conversational — 1-3 sentences max unless a breakdown is needed.
- Use ₹ for currency values.
- If the data context doesn't have the answer, say so honestly.
- Never make up data that isn't in the context.`;

            // Build chat history with context priming
            const history = [
                { role: "user", parts: [{ text: contextText }] },
                { role: "model", parts: [{ text: "Understood! I have your ERP data loaded. Ask me anything about your business." }] },
                ...messages.slice(0, -1).map((m: { role: string; text: string }) => ({
                    role: m.role,
                    parts: [{ text: m.text }],
                })),
            ];

            const lastMsg = messages[messages.length - 1].text;

            const text = await geminiContent({
                contents: [...history, { role: "user", parts: [{ text: lastMsg }] }],
                generationConfig: { temperature: 0.7 },
            });
            return json({ reply: text.trim() });
        }

        // ── Parse natural language → form prefill ─────────────────────────────
        if (type === "parse_form") {
            const { text, products, contacts } = payload;

            const prompt = `You are an ERP assistant. The user typed the following message:
"${text}"

Available products: ${JSON.stringify(products.map((p: { name: string }) => p.name))}
Available contacts (customers/suppliers): ${JSON.stringify(contacts.map((c: { name: string }) => c.name))}

Your job: determine if the user wants to create a Sale, Purchase, or Quotation, and extract the details.

Respond ONLY with this JSON (no markdown, no explanation):
{
  "intent": "sale" | "purchase" | "quotation" | "none",
  "contact_name": "<matched contact name from the list, or null>",
  "items": [
    {
      "product_name": "<matched product name from the list above>",
      "quantity": <number>,
      "unit_price": <number or 0 if not mentioned>
    }
  ],
  "message": "<friendly 1-line confirmation message to show the user, e.g. 'I've prepared a Sale for Taj Glass with 2 items.'>"
}

Rules:
- intent is "none" if the message is NOT about creating a sale/purchase/quotation.
- Match product and contact names to the closest item in the available lists — use the exact names from the lists.
- If price is not mentioned, use 0.
- items array must be empty [] if no products mentioned.`;

            const responseText = await geminiContent({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 },
            });

            const parsed = parseResponseJson(responseText) as {
                intent: string;
                contact_name: string | null;
                items: { product_name: string; quantity: number; unit_price: number }[];
                message: string;
            };

            return json(parsed);
        }

        return jsonErr(`Unknown type: ${type}`, 400);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return jsonErr(msg, 500);
    }
});
