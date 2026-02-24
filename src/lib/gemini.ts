import { GoogleGenerativeAI } from "@google/generative-ai";

export interface InvoiceItem {
    product_name: string;
    quantity: number;
    unit_price: number;
}

export interface ParsedInvoice {
    supplier_name: string | null;
    items: InvoiceItem[];
}

export async function parseInvoiceImage(base64Image: string, mimeType: string): Promise<ParsedInvoice> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not set in .env");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an invoice parser. Analyze this invoice/bill image and extract the following information as valid JSON only, without any markdown or explanation:
{
  "supplier_name": "<vendor/supplier company name or null>",
  "items": [
    {
      "product_name": "<product or item name>",
      "quantity": <number>,
      "unit_price": <number, price per unit, no currency symbol>
    }
  ]
}

Rules:
- Extract ALL line items visible.
- If a field is not visible, use null for strings and 0 for numbers.
- unit_price should be per-unit cost, NOT the total line amount.
- Respond with ONLY the JSON object, no other text.`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                mimeType,
                data: base64Image,
            },
        },
    ]);

    const text = result.response.text().trim();

    try {
        // Strip markdown code fences if present
        const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        return JSON.parse(clean) as ParsedInvoice;
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as ParsedInvoice;
        throw new Error("Could not parse Gemini response as JSON");
    }
}
