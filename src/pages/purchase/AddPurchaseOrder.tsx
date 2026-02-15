import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2 } from "lucide-react";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useCreatePurchaseOrder } from "@/api/purchase";
import { useTaxRates } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { useStores } from "@/api/stores"; // Add import

const AddPurchaseOrder = () => {
    const navigate = useNavigate();
    const { data: suppliers } = useContacts(); // We filter for suppliers in the render
    const { data: products } = useProducts();
    const { data: stores } = useStores(); // Get stores
    const currentStore = stores?.[0]; // Assuming single store context
    const { data: taxRates } = useTaxRates(currentStore?.id); // Pass storeId
    const createOrder = useCreatePurchaseOrder();

    const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [orderNo, setOrderNo] = useState(`PO-${Date.now()}`); // Simple auto-gen
    const [supplierId, setSupplierId] = useState("");
    const [notes, setNotes] = useState("");

    // Items State
    const [items, setItems] = useState<any[]>([]);

    // Current adding item state
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        quantity: 1,
        unitPrice: 0,
        taxRateId: ""
    });

    const supplierList = suppliers?.filter(c => c.role === 'Supplier' || c.role === 'Both') || [];

    const handleProductChange = (productId: string) => {
        const product = products?.find(p => p.id === productId);
        if (product) {
            setCurrentItem({
                ...currentItem,
                productId,
                unitPrice: product.purchase_price || 0
            });
        }
    };

    const addItem = () => {
        if (!currentItem.productId) {
            toast.error("Please select a product");
            return;
        }
        const product = products?.find(p => p.id === currentItem.productId);

        let taxAmount = 0;
        let taxPercentage = 0;

        // Find selected tax rate
        if (currentItem.taxRateId) {
            const rate = taxRates?.find(r => r.id === currentItem.taxRateId);
            if (rate) {
                taxPercentage = rate.percentage;
                // Tax = (Price * Qty * Rate) / 100
                taxAmount = (currentItem.unitPrice * currentItem.quantity * rate.percentage) / 100;
            }
        }

        const subtotal = (currentItem.quantity * currentItem.unitPrice) + taxAmount;

        const newItem = {
            ...currentItem,
            productName: product?.name,
            taxPercentage,
            taxAmount,
            subtotal
        };
        setItems([...items, newItem]);
        // Reset current item (keep quantity 1 for convenience)
        setCurrentItem({ productId: "", quantity: 1, unitPrice: 0, taxRateId: "" });
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = async () => {
        if (!supplierId) {
            toast.error("Please select a supplier");
            return;
        }
        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        try {
            await createOrder.mutateAsync({
                order: {
                    order_no: orderNo,
                    supplier_id: supplierId,
                    order_date: orderDate,
                    total_amount: calculateTotal(),
                    notes,
                    // Status is handled in the API (defaults to Received)
                },
                items: items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    subtotal: item.subtotal,
                    tax_rate_id: item.taxRateId || null,
                    tax_amount: item.taxAmount
                }))
            });
            toast.success("Purchase Order created successfully");
            navigate("/purchase/order");
        } catch (error) {
            toast.error("Failed to create purchase order");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Purchase Order</CardTitle>
                        <CardDescription>
                            Create a new purchase order for a supplier
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Header Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Supplier *</Label>
                                <Select value={supplierId} onValueChange={setSupplierId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supplierList.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="order_date"
                                    label="Order Date"
                                    type="date"
                                    value={orderDate}
                                    onChange={e => setOrderDate(e.target.value)}
                                    className="pt-4"
                                />
                            </div>
                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="order_no"
                                    label="Order No."
                                    value={orderNo}
                                    onChange={e => setOrderNo(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Add Item Section */}
                        <div className="border p-4 rounded-md bg-muted/20">
                            <h3 className="font-semibold mb-3">Add Product items</h3>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-5 space-y-2">
                                    <Label>Product</Label>
                                    <Select value={currentItem.productId} onValueChange={handleProductChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.current_stock})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <FloatingLabelInput
                                        id="quantity"
                                        label="Quantity"
                                        type="number"
                                        min="1"
                                        value={currentItem.quantity}
                                        onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <FloatingLabelInput
                                        id="unit_price"
                                        label="Unit Cost"
                                        type="number"
                                        min="0"
                                        value={currentItem.unitPrice}
                                        onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Label>Tax</Label>
                                    <Select
                                        value={currentItem.taxRateId}
                                        onValueChange={(val) => setCurrentItem({ ...currentItem, taxRateId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tax" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {taxRates?.map(rate => (
                                                <SelectItem key={rate.id} value={rate.id}>
                                                    {rate.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Button className="w-full" onClick={addItem}>Add Item</Button>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Tax</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No items added yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.taxPercentage > 0 ? `${item.taxPercentage}%` : '0%'}
                                                    </div>
                                                    ₹{item.taxAmount.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">₹{item.subtotal.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Footer / Total */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/50 p-4 rounded-md gap-4">
                            <div className="w-full md:w-1/2">
                                <Label>Notes</Label>
                                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." rows={2} />
                            </div>
                            <div className="w-full md:text-right">
                                <div className="text-2xl font-bold text-primary">Total: ₹{calculateTotal().toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={() => navigate("/purchase/order")}>Cancel</Button>
                            <Button size="lg" onClick={handleSubmit} disabled={createOrder.isPending}>
                                {createOrder.isPending ? "Creating..." : "Create Purchase Order"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddPurchaseOrder;
