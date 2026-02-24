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

    const prompt = `You are an invoice parser. Analyze this invoice/bill image and extract the following information as valid JSON only, without any markdown or explanation:
{
  "supplier_name": "<vendor/supplier company name or null>",
  "items": [
    {
      "product_name": "<product or item name>",
      "quantity": <number>,
      "unit_price": <number, price per unit in numeric form, no currency symbol>
    }
  ]
}

Rules:
- Extract ALL line items visible in the invoice.
- If a field is not visible, use null for strings and 0 for numbers.
- unit_price should be the per-unit cost, NOT the total line amount.
- Respond with ONLY the JSON object, no other text.`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType,
                                    data: base64Image,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json",
                },
            }),
        }
    );

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Gemini API error");
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    try {
        return JSON.parse(text) as ParsedInvoice;
    } catch {
        // Try extracting JSON from response if it has extra text
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]) as ParsedInvoice;
        throw new Error("Could not parse Gemini response as JSON");
    }
}
