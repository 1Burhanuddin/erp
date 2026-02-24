import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, ScanLine, Loader2, AlertTriangle } from "lucide-react";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useCreateSale } from "@/api/sales";
import { useTaxRates } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useAiOrderScan } from "@/hooks/useAiOrderScan";
import { UnmatchedItemRow } from "@/components/ai/UnmatchedItemRow";

const DirectSale = () => {
    const navigate = useNavigate();
    const { data: customers } = useContacts();
    const { data: products } = useProducts();
    const { data: taxRates } = useTaxRates();
    const createSale = useCreateSale();

    const [customerId, setCustomerId] = useState("");
    const [orderNo] = useState(`DS-${Date.now()}`);
    const [items, setItems] = useState<any[]>([]);
    const [aiCustomerName, setAiCustomerName] = useState<string | null>(null);
    const location = useLocation();

    const { isScanning, fileInputRef, triggerScan, handleFileChange } = useAiOrderScan({
        mode: "sale",
        contacts: customers,
        products,
        onContactMatched: (id) => { setCustomerId(id); setAiCustomerName(null); },
        onContactUnmatched: (name) => setAiCustomerName(name),
        onItemsScanned: setItems,
    });

    // ── Apply chatbot prefill on mount ─────────────────────────────────────────
    useEffect(() => {
        const prefill = (location.state as any)?.prefill;
        if (!prefill || !customers || !products) return;

        if (prefill.contactId) setCustomerId(prefill.contactId);
        else if (prefill.contactName) setAiCustomerName(prefill.contactName);

        if (prefill.items?.length) {
            const newItems = prefill.items.map((ai: any) => {
                const matched = products.find(p => p.id === ai.productId) ||
                    products.find(p => p.name.toLowerCase().includes(ai.productName?.toLowerCase()));
                const unitPrice = ai.unitPrice || matched?.sale_price || 0;
                const qty = ai.quantity || 1;
                return {
                    productId: matched?.id || "",
                    productName: matched?.name || ai.productName,
                    aiProductName: ai.productName,
                    quantity: qty,
                    unitPrice,
                    currentStock: matched?.current_stock || 0,
                    taxRateId: "",
                    taxAmount: 0,
                    subtotal: qty * unitPrice,
                    unmatched: !matched?.id,
                };
            });
            setItems(newItems);
            toast.success(`${newItems.length} item(s) pre-filled from AI. Review and complete the sale.`);
        }
    }, [customers, products]); // runs when data loads

    const [currentItem, setCurrentItem] = useState({
        productId: "",
        quantity: 1,
        unitPrice: 0,
        currentStock: 0,
        taxRateId: ""
    });

    const handleProductChange = (productId: string) => {
        const product = products?.find(p => p.id === productId);
        if (product) {
            setCurrentItem({
                ...currentItem,
                productId,
                unitPrice: product.sale_price || 0,
                currentStock: product.current_stock || 0
            });
        }
    };

    // ── Fix unmatched item ──────────────────────────────────────────────────────
    const fixItemProduct = (idx: number, productId: string) => {
        const product = products?.find(p => p.id === productId);
        setItems(prev => prev.map((item, i) =>
            i !== idx ? item : {
                ...item,
                productId,
                productName: product?.name || item.productName,
                unitPrice: item.unitPrice || product?.sale_price || 0,
                currentStock: product?.current_stock || 0,
                subtotal: item.quantity * (item.unitPrice || product?.sale_price || 0),
                unmatched: false,
            }
        ));
    };

    const addItem = () => {
        if (!currentItem.productId) return toast.error("Select product");
        if (currentItem.quantity > currentItem.currentStock) return toast.error("Insufficient stock");

        const product = products?.find(p => p.id === currentItem.productId);

        let taxAmount = 0;
        let taxPercentage = 0;
        if (currentItem.taxRateId) {
            const rate = taxRates?.find(r => r.id === currentItem.taxRateId);
            if (rate) {
                taxPercentage = rate.percentage;
                taxAmount = (currentItem.unitPrice * currentItem.quantity * rate.percentage) / 100;
            }
        }

        setItems([...items, {
            ...currentItem,
            productName: product?.name,
            taxPercentage,
            taxAmount,
            subtotal: (currentItem.quantity * currentItem.unitPrice) + taxAmount
        }]);
        setCurrentItem({ productId: "", quantity: 1, unitPrice: 0, currentStock: 0, taxRateId: "" });
    };

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const handleCompleteSale = async () => {
        if (!customerId) return toast.error("Select customer (or Walk-in)");
        if (items.length === 0) return toast.error("Add items");
        if (items.some(i => !i.productId)) return toast.error("Some items have unmatched products. Please fix them.");

        try {
            await createSale.mutateAsync({
                order: {
                    order_no: orderNo,
                    customer_id: customerId,
                    order_date: format(new Date(), "yyyy-MM-dd"),
                    total_amount: totalAmount,
                    status: 'Completed',
                    payment_status: 'Paid',
                    paid_amount: totalAmount,
                    channel: 'Direct'
                } as any,
                items: items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    subtotal: item.subtotal,
                    tax_rate_id: item.taxRateId || null,
                    tax_amount: item.taxAmount
                }))
            });
            toast.success("Sale order created successfully!");
            navigate("/sell/order");
        } catch (error) {
            toast.error("Failed to complete sale");
        }
    };

    return (
        <PageLayout>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-2 md:p-4">
                {/* Left: Input Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border rounded-xl shadow-sm p-3 md:p-6 space-y-4 md:space-y-6">

                        {/* AI Scan Button */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="font-semibold text-base">Direct Sale</h3>
                                <p className="text-sm text-muted-foreground">Fill manually or scan a customer order</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={triggerScan}
                                disabled={isScanning}
                                className="gap-2 border-primary text-primary hover:bg-primary/10"
                            >
                                {isScanning
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning...</>
                                    : <><ScanLine className="h-4 w-4" /> Scan Order</>
                                }
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="flex gap-2">
                                    <Select value={customerId} onValueChange={setCustomerId}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select / Walk-in Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                                            {customers?.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {aiCustomerName && !customerId && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        AI detected: <span className="font-medium">{aiCustomerName}</span> — select manually above
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Manual Add Item */}
                        <div className="border rounded-xl p-3 md:p-4 bg-muted/20">
                            <h3 className="font-semibold mb-3 text-base">Add Item Manually</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Product</Label>
                                    <Select value={currentItem.productId} onValueChange={handleProductChange}>
                                        <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                        <SelectContent>
                                            {products?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                                    <FloatingLabelInput
                                        id="quantity"
                                        label="Qty"
                                        type="number"
                                        min="1"
                                        value={currentItem.quantity}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                    />
                                    <FloatingLabelInput
                                        id="price"
                                        label="Price"
                                        type="number"
                                        value={currentItem.unitPrice}
                                        onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                                    />
                                    <div className="space-y-1.5">
                                        <Select value={currentItem.taxRateId} onValueChange={val => setCurrentItem({ ...currentItem, taxRateId: val })}>
                                            <SelectTrigger><SelectValue placeholder="Tax %" /></SelectTrigger>
                                            <SelectContent>
                                                {taxRates?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={addItem}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                        <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
                            {items.some(i => i.unmatched) && (
                                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm px-4 py-2 border-b border-amber-200 dark:border-amber-800">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    Some items couldn't be matched. Select the correct product below.
                                </div>
                            )}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={idx} className={item.unmatched ? "bg-amber-50/50 dark:bg-amber-950/20" : "hover:bg-muted/30"}>
                                                <TableCell className="min-w-[180px]">
                                                    {item.unmatched ? (
                                                        <UnmatchedItemRow
                                                            aiProductName={item.aiProductName}
                                                            products={products}
                                                            onFix={(v) => fixItemProduct(idx, v)}
                                                        />
                                                    ) : item.productName}
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                                                <TableCell className="font-semibold">₹{item.subtotal.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => { const n = [...items]; n.splice(idx, 1); setItems(n); }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Summary Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-xl shadow-sm p-4 md:p-6 space-y-4 lg:sticky lg:top-4">
                        <h3 className="text-lg md:text-xl font-bold border-b pb-2">Sale Summary</h3>
                        <div className="space-y-3 text-base">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total items:</span>
                                <span className="font-semibold">{items.length}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-primary pt-2 border-t">
                                <span>Total:</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleCompleteSale} disabled={createSale.isPending}>
                            {createSale.isPending ? "Processing..." : "Complete Sale (Paid)"}
                        </Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default DirectSale;
