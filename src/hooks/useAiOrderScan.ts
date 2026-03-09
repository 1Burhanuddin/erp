import { useState, useRef } from "react";
import Fuse from "fuse.js";
import { toast } from "sonner";
import { parseInvoiceImage, parseSaleOrderImage } from "@/lib/gemini";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface ScanItem {
    productId: string;
    productName: string;
    aiProductName: string;
    quantity: number;
    unitPrice: number;
    currentStock?: number;
    taxRateId: string;
    taxAmount: number;
    subtotal: number;
    unmatched: boolean;
}

interface Contact {
    id: string;
    name: string;
    role?: string | null;
}

interface Product {
    id: string;
    name: string;
    purchase_price?: number;
    sale_price?: number;
    current_stock?: number;
}

interface UseAiOrderScanOptions {
    mode: "sale" | "purchase";
    contacts: Contact[] | undefined;
    products: Product[] | undefined;
    onContactMatched: (id: string) => void;
    onContactUnmatched: (name: string) => void;
    onItemsScanned: (items: ScanItem[]) => void;
}

export function useAiOrderScan({
    mode,
    contacts,
    products,
    onContactMatched,
    onContactUnmatched,
    onItemsScanned,
}: UseAiOrderScanOptions) {
    const [isScanning, setIsScanning] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const triggerCamera = () => cameraInputRef.current?.click();
    const triggerGallery = () => galleryInputRef.current?.click();

    // ── Fuse.js fuzzy contact match ─────────────────────────────────────────
    const fuseContacts = contacts
        ? new Fuse(contacts, { keys: ["name"], threshold: 0.35, includeScore: true })
        : null;

    const fuzzyMatchContact = (aiName: string): Contact | undefined => {
        if (!fuseContacts || !aiName) return undefined;
        const results = fuseContacts.search(aiName);
        const best = results[0];
        // Accept match only if score is below 0.35 (lower = better)
        if (best && (best.score ?? 1) < 0.35) return best.item;
        return undefined;
    };

    // ── Fuse.js fuzzy product match ─────────────────────────────────────────
    const fuseProducts = products
        ? new Fuse(products, { keys: ["name"], threshold: 0.4, includeScore: true })
        : null;

    const fuzzyMatchProduct = (aiProductName: string): Product | undefined => {
        if (!fuseProducts || !aiProductName) return undefined;
        const results = fuseProducts.search(aiProductName);
        const best = results[0];
        if (best && (best.score ?? 1) < 0.4) return best.item;
        return undefined;
    };

    // ── handleFileChange ────────────────────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset so same file can be re-selected
        e.target.value = "";

        // ── File validation ──────────────────────────────────────────────
        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are supported for scanning.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Image is too large. Please use an image under 10 MB.");
            return;
        }

        setIsScanning(true);
        try {
            // ── Convert to base64 ────────────────────────────────────────
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(",")[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // ── Call the appropriate AI function ─────────────────────────
            const parsed = mode === "purchase"
                ? await parseInvoiceImage(base64, file.type)
                : await parseSaleOrderImage(base64, file.type);

            // ── Match contact ────────────────────────────────────────────
            const contactName = mode === "purchase"
                ? (parsed as any).supplier_name
                : (parsed as any).customer_name;

            if (contactName) {
                const matched = fuzzyMatchContact(contactName);
                if (matched) {
                    onContactMatched(matched.id);
                } else {
                    onContactUnmatched(contactName);
                }
            }

            // ── Map items ────────────────────────────────────────────────
            if (parsed.items?.length) {
                const fallbackPrice = (p: Product | undefined) =>
                    mode === "purchase" ? p?.purchase_price ?? 0 : p?.sale_price ?? 0;

                const newItems: ScanItem[] = parsed.items.map(ai => {
                    const match = fuzzyMatchProduct(ai.product_name);
                    const unitPrice = ai.unit_price || fallbackPrice(match);
                    const quantity = ai.quantity || 1;
                    return {
                        productId: match?.id ?? "",
                        productName: match?.name ?? ai.product_name,
                        aiProductName: ai.product_name,
                        quantity,
                        unitPrice,
                        currentStock: match?.current_stock,
                        taxRateId: "",
                        taxAmount: 0,
                        subtotal: quantity * unitPrice,
                        unmatched: !match,
                    };
                });

                onItemsScanned(newItems);
                const label = mode === "purchase" ? "Invoice" : "Order";
                toast.success(`${label} scanned! ${newItems.length} item(s) found. Review and confirm.`);
            } else {
                toast.warning("No items could be extracted. Try a clearer image.");
            }
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to scan image.");
        } finally {
            setIsScanning(false);
        }
    };

    return { 
        isScanning, 
        cameraInputRef, 
        galleryInputRef, 
        triggerCamera, 
        triggerGallery, 
        handleFileChange 
    };
}
