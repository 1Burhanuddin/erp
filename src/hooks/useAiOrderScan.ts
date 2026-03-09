import { useState, useRef, useCallback } from "react";
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

interface PendingImage {
    base64: string;
    mimeType: string;
    previewUrl: string;
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
    const [showPreview, setShowPreview] = useState(false);

    // Batch queue of pending images
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const triggerCamera = () => cameraInputRef.current?.click();
    const triggerGallery = () => galleryInputRef.current?.click();

    // Current preview URL
    const previewUrl = pendingImages[currentPreviewIndex]?.previewUrl ?? null;

    // ── Fuse.js fuzzy contact match ─────────────────────────────────────────
    const fuseContacts = contacts
        ? new Fuse(contacts, { keys: ["name"], threshold: 0.35, includeScore: true })
        : null;

    const fuzzyMatchContact = (aiName: string): Contact | undefined => {
        if (!fuseContacts || !aiName) return undefined;
        const results = fuseContacts.search(aiName);
        const best = results[0];
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

    // ── Process a single image with AI ──────────────────────────────────────
    const processOneImage = async (base64: string, mimeType: string): Promise<ScanItem[]> => {
        const parsed = mode === "purchase"
            ? await parseInvoiceImage(base64, mimeType)
            : await parseSaleOrderImage(base64, mimeType);

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

        if (!parsed.items?.length) return [];

        const fallbackPrice = (p: Product | undefined) =>
            mode === "purchase" ? p?.purchase_price ?? 0 : p?.sale_price ?? 0;

        return parsed.items.map(ai => {
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
    };

    // ── Batch process all pending images ────────────────────────────────────
    const confirmPreview = useCallback(async () => {
        if (pendingImages.length === 0) return;
        setIsScanning(true);

        try {
            let allItems: ScanItem[] = [];
            let processedCount = 0;

            for (const img of pendingImages) {
                try {
                    const items = await processOneImage(img.base64, img.mimeType);
                    allItems = [...allItems, ...items];
                    processedCount++;
                } catch (err: any) {
                    toast.error(`Failed to scan document ${processedCount + 1}: ${err?.message ?? "Unknown error"}`);
                    processedCount++;
                }
            }

            if (allItems.length > 0) {
                onItemsScanned(allItems);
                const label = mode === "purchase" ? "Invoice" : "Order";
                const docWord = pendingImages.length > 1 ? `${pendingImages.length} documents` : label;
                toast.success(`${docWord} scanned! ${allItems.length} item(s) found. Review and confirm.`);
            } else {
                toast.warning("No items could be extracted. Try clearer images.");
            }
        } finally {
            setIsScanning(false);
            setShowPreview(false);
            // Clean up object URLs
            pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
            setPendingImages([]);
            setCurrentPreviewIndex(0);
        }
    }, [pendingImages, mode, contacts, products]);

    // ── handleFileChange → add to batch queue ───────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are supported for scanning.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Image is too large. Please use an image under 10 MB.");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const newImage: PendingImage = { base64, mimeType: file.type, previewUrl: objectUrl };
        setPendingImages(prev => {
            const updated = [...prev, newImage];
            setCurrentPreviewIndex(updated.length - 1);
            return updated;
        });
        setShowPreview(true);
    };

    // ── Preview navigation ──────────────────────────────────────────────────
    const removeCurrentImage = useCallback(() => {
        setPendingImages(prev => {
            const updated = prev.filter((_, i) => i !== currentPreviewIndex);
            if (updated.length === 0) {
                setShowPreview(false);
                setCurrentPreviewIndex(0);
                return [];
            }
            setCurrentPreviewIndex(Math.min(currentPreviewIndex, updated.length - 1));
            return updated;
        });
    }, [currentPreviewIndex]);

    const retakePreview = useCallback(() => {
        removeCurrentImage();
    }, [removeCurrentImage]);

    const closePreview = useCallback(() => {
        setShowPreview(false);
        pendingImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
        setPendingImages([]);
        setCurrentPreviewIndex(0);
    }, [pendingImages]);

    const goToPrevImage = useCallback(() => {
        setCurrentPreviewIndex(prev => Math.max(0, prev - 1));
    }, []);

    const goToNextImage = useCallback(() => {
        setCurrentPreviewIndex(prev => Math.min(pendingImages.length - 1, prev + 1));
    }, [pendingImages.length]);

    return {
        isScanning,
        cameraInputRef,
        galleryInputRef,
        triggerCamera,
        triggerGallery,
        handleFileChange,
        // Preview state
        previewUrl,
        showPreview,
        confirmPreview,
        retakePreview,
        closePreview,
        // Batch state
        pendingImages,
        currentPreviewIndex,
        goToPrevImage,
        goToNextImage,
        totalPendingImages: pendingImages.length,
    };
}
