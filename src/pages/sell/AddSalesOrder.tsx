import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

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
import { useCreateSalesOrder } from "@/api/sales";
import { useTaxRates } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const AddSalesOrder = () => {
    const navigate = useNavigate();
    const { data: customers } = useContacts();
    const { data: products } = useProducts();
    const { data: taxRates } = useTaxRates();
    const createOrder = useCreateSalesOrder();

    const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [orderNo, setOrderNo] = useState(`SO-${Date.now()}`);
    const [customerId, setCustomerId] = useState("");
    const [notes, setNotes] = useState("");

    const [items, setItems] = useState<any[]>([]);
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        quantity: 1,
        unitPrice: 0,
        currentStock: 0,
        taxRateId: ""
    });

    const customerList = customers?.filter(c => c.role === 'Customer' || c.role === 'Both') || [];

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
        if (!currentItem.productId) {
            toast.error("Please select a product");
            return;
        }

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

        const subtotal = (currentItem.quantity * currentItem.unitPrice) + taxAmount;

        setItems([...items, {
            ...currentItem,
            productName: product?.name,
            taxPercentage,
            taxAmount,
            subtotal
        }]);
        setCurrentItem({ productId: "", quantity: 1, unitPrice: 0, currentStock: 0, taxRateId: "" });
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const handleSubmit = async () => {
        if (!customerId) return toast.error("Please select a customer");
        if (items.length === 0) return toast.error("Please add items");

        try {
            await createOrder.mutateAsync({
                order: {
                    order_no: orderNo,
                    customer_id: customerId,
                    order_date: orderDate,
                    total_amount: totalAmount,
                    notes
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
            toast.success("Sales Order created successfully");
            navigate("/sell/order");
        } catch (error) {
            toast.error("Failed to create sales order");
        }
    };

    return (
        <PageLayout>
            <div className="p-2 md:p-6">
                <Card className="max-w-6xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-7">
                        <CardTitle>Create Sales Order</CardTitle>
                        <CardDescription>Create a new pending sales order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2 col-span-1 md:col-span-1">
                                    <Label>Customer *</Label>
                                    <Select value={customerId} onValueChange={setCustomerId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customerList.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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

                            <div className="border p-4 rounded-md bg-muted/20">
                                <h3 className="font-semibold mb-3">Add Product items</h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4 space-y-2">
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
                                            label="Unit Price"
                                            type="number"
                                            min="0"
                                            value={currentItem.unitPrice}
                                            onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-md">
                                <div>
                                    <Label>Notes</Label>
                                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." rows={3} />
                                </div>
                                <div className="flex justify-end items-end flex-col">
                                    <div className="text-xl font-bold">Total: ₹{totalAmount.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" onClick={() => navigate("/sell/order")}>Cancel</Button>
                                <Button size="lg" onClick={handleSubmit} disabled={createOrder.isPending}>
                                    {createOrder.isPending ? "Creating..." : "Create Order"}
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </PageLayout >
    );
};

export default AddSalesOrder;
