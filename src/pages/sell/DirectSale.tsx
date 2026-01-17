import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2 } from "lucide-react";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useCreateSale } from "@/api/sales";
import { useTaxRates } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const DirectSale = () => {
    const navigate = useNavigate();
    const { data: customers } = useContacts();
    const { data: products } = useProducts();
    const { data: taxRates } = useTaxRates();
    const createSale = useCreateSale();

    const [customerId, setCustomerId] = useState("");
    const [orderNo] = useState(`DS-${Date.now()}`); // Auto-generate
    const [items, setItems] = useState<any[]>([]);

    // Quick Add Item State
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

        try {
            await createSale.mutateAsync({
                order: {
                    order_no: orderNo,
                    customer_id: customerId,
                    order_date: format(new Date(), "yyyy-MM-dd"), // Today
                    total_amount: totalAmount,
                    status: 'Completed',
                    payment_status: 'Paid', // Assume Cash/Immediate Payment
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
            toast.success("Direct Sale Completed!");
            // Reset or navigate
            navigate(0); // Reload for new sale
        } catch (error) {
            toast.error("Failed to complete sale");
        }
    };

    return (
        <PageLayout>
            <PageHeader title="Direct Sale (POS)" description="Quick sale counter" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                {/* Left: Input Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border rounded-md p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select / Walk-in" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="walk-in">Walk-in Customer</SelectItem> {/* Handle this logic if needed, or mapped to a dummy contact */}
                                        {customers?.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Product Scan/Select</Label>
                                <Select value={currentItem.productId} onValueChange={handleProductChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products?.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Qty</Label>
                                <Input type="number" min="1" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input type="number" value={currentItem.unitPrice} onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tax</Label>
                                <Select value={currentItem.taxRateId} onValueChange={val => setCurrentItem({ ...currentItem, taxRateId: val })}>
                                    <SelectTrigger><SelectValue placeholder="%" /></SelectTrigger>
                                    <SelectContent>
                                        {taxRates?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={addItem}>Add</Button>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="border rounded-md bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{item.unitPrice}</TableCell>
                                        <TableCell>{item.subtotal.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Trash2 className="w-4 h-4 cursor-pointer text-destructive" onClick={() => {
                                                const n = [...items]; n.splice(idx, 1); setItems(n);
                                            }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Right: Summary Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-md p-6 space-y-6 sticky top-4">
                        <h3 className="text-xl font-bold border-b pb-2">Sale Summary</h3>
                        <div className="space-y-2 text-lg">
                            <div className="flex justify-between">
                                <span>Total items:</span>
                                <span>{items.length}</span>
                            </div>
                            <div className="flex justify-between font-bold text-2xl text-primary">
                                <span>Total:</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleCompleteSale}>Complete Sale (Paid)</Button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default DirectSale;
