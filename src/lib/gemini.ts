import { GoogleGenerativeAI } from "@google/generative-ai";

export interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
}

export interface ParsedOrder {
    contact_name: string | null;  // supplier for purchase, customer for sales
    items: OrderItem[];
}

function getModel() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not set in .env");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

function parseJson(text: string): ParsedOrder {
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    try {
        return JSON.parse(clean);
    } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Could not parse Gemini response as JSON");
    }
}

const ORDER_PROMPT = (contactLabel: string) => `You are an order/invoice parser. Analyze this image and extract the following as valid JSON only, no markdown:
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

/** Parse a purchase invoice image — returns supplier_name + items */
export async function parseInvoiceImage(base64Image: string, mimeType: string): Promise<ParsedOrder & { supplier_name: string | null }> {
    const model = getModel();
    const result = await model.generateContent([
        ORDER_PROMPT("supplier_name"),
        { inlineData: { mimeType, data: base64Image } },
    ]);
    const parsed = parseJson(result.response.text().trim());
    return { ...parsed, supplier_name: parsed.contact_name };
}

/** Parse a customer PO / sales order image — returns customer_name + items */
export async function parseSaleOrderImage(base64Image: string, mimeType: string): Promise<ParsedOrder & { customer_name: string | null }> {
    const model = getModel();
    const result = await model.generateContent([
        ORDER_PROMPT("customer_name"),
        { inlineData: { mimeType, data: base64Image } },
    ]);
    const parsed = parseJson(result.response.text().trim());
    return { ...parsed, customer_name: parsed.contact_name };
}

/** Analyze any report data and return plain-English business insights */
export async function analyzeReport(reportType: string, data: object): Promise<string> {
    const model = getModel();
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

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
}
