import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
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
import { useCreateSale } from "@/api/sales";
import { useTaxRates } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { useStores } from "@/api/stores"; // Add same for Sales Invoice

const AddSalesInvoice = () => {
    const navigate = useNavigate();
    const { data: customers } = useContacts();
    const { data: products } = useProducts();
    const { data: stores } = useStores();
    const currentStore = stores?.[0];
    const { data: taxRates } = useTaxRates(currentStore?.id);
    const createSale = useCreateSale();

    const [orderDate, setOrderDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [orderNo, setOrderNo] = useState(`INV-${Date.now()}`);
    const [customerId, setCustomerId] = useState("");
    const [notes, setNotes] = useState("");

    // Payment State
    const [paidAmount, setPaidAmount] = useState(0);

    // Items State
    /* 
       Item Structure:
       {
         productId: string,
         productName: string,
         quantity: number,
         unitPrice: number,
         taxRateId: string, // ID of selected tax rate
         taxPercentage: number, // Percentage for calculation
         taxAmount: number,
         subtotal: number // (quantity * unitPrice) + taxAmount
       }
    */
    const [items, setItems] = useState<any[]>([]);

    // Current adding item state
    const [currentItem, setCurrentItem] = useState({
        productId: "",
        quantity: 1,
        unitPrice: 0,
        currentStock: 0,
        taxRateId: "",
        isTaxInclusive: false
    });

    const customerList = customers?.filter(c => c.role === 'Customer' || c.role === 'Both') || [];

    const handleProductChange = (productId: string) => {
        const product = products?.find(p => p.id === productId);
        if (product) {
            setCurrentItem({
                ...currentItem,
                productId,
                unitPrice: product.sale_price || 0,
                currentStock: product.current_stock || 0,
                isTaxInclusive: product.is_tax_inclusive || false
            });
        }
    };

    const addItem = () => {
        if (!currentItem.productId) {
            toast.error("Please select a product");
            return;
        }

        if (currentItem.quantity > currentItem.currentStock) {
            toast.error(`Insufficient stock! Available: ${currentItem.currentStock}`);
            return;
        }

        const product = products?.find(p => p.id === currentItem.productId);

        let taxAmount = 0;
        let taxPercentage = 0;

        // Find selected tax rate
        // Find selected tax rate
        let baseUnitPrice = currentItem.unitPrice;

        if (currentItem.taxRateId) {
            const rate = taxRates?.find(r => r.id === currentItem.taxRateId);
            if (rate) {
                taxPercentage = rate.percentage;

                if (currentItem.isTaxInclusive) {
                    // Reverse calculate base price
                    baseUnitPrice = currentItem.unitPrice / (1 + (rate.percentage / 100));
                }

                // Tax = (Base Price * Qty * Rate) / 100
                taxAmount = (baseUnitPrice * currentItem.quantity * rate.percentage) / 100;
            }
        }

        const subtotal = (currentItem.quantity * baseUnitPrice) + taxAmount;

        const newItem = {
            ...currentItem,
            unitPrice: baseUnitPrice, // Store Base Price
            productName: product?.name,
            taxPercentage,
            taxAmount,
            subtotal
        };
        setItems([...items, newItem]);
        // Reset
        setCurrentItem({ productId: "", quantity: 1, unitPrice: 0, currentStock: 0, taxRateId: "", isTaxInclusive: false });
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const totalAmount = calculateTotal();
    const balanceDue = totalAmount - paidAmount;

    const handleSubmit = async () => {
        if (!customerId) {
            toast.error("Please select a customer");
            return;
        }
        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }
        if (paidAmount > totalAmount) {
            toast.error("Paid amount cannot be greater than total amount");
            return;
        }

        // Determine status
        let status = 'Unpaid';
        if (paidAmount >= totalAmount) status = 'Paid';
        else if (paidAmount > 0) status = 'Partial';

        try {
            await createSale.mutateAsync({
                order: {
                    order_no: orderNo,
                    customer_id: customerId,
                    order_date: orderDate,
                    total_amount: totalAmount,
                    notes,
                    payment_status: status,
                    paid_amount: paidAmount
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
            toast.success("Sales Invoice created successfully");
            navigate("/sell/invoice");
        } catch (error) {
            toast.error("Failed to create sales invoice");
            console.error(error);
        }
    };

    return (
        <PageLayout>
            <div className="p-2 md:p-6">
                <Card className="max-w-6xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-7">
                        <CardTitle>Create Sales Invoice</CardTitle>
                        <CardDescription>Create a new invoice for a customer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Header Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5 col-span-1 md:col-span-1">
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
                                        id="invoice_date"
                                        label="Invoice Date"
                                        type="date"
                                        className="pt-4"
                                        value={orderDate}
                                        onChange={e => setOrderDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <FloatingLabelInput
                                        id="invoice_no"
                                        label="Invoice No."
                                        value={orderNo}
                                        onChange={e => setOrderNo(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Add Item Section */}
                            <div className="border p-4 rounded-md bg-muted/20">
                                <h3 className="font-semibold mb-3">Add Product items</h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-4 space-y-1.5">
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
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label>Stock</Label>
                                        <FloatingLabelInput
                                            id="stock"
                                            label="Stock"
                                            disabled
                                            value={currentItem.currentStock}
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <FloatingLabelInput
                                            id="quantity"
                                            label="Quantity"
                                            type="number"
                                            min="1"
                                            max={currentItem.currentStock || undefined}
                                            value={currentItem.quantity}
                                            onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <FloatingLabelInput
                                            id="unit_price"
                                            label="Unit Price"
                                            type="number"
                                            min="0"
                                            value={currentItem.unitPrice}
                                            onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label>Tax Rate</Label>
                                        <Select
                                            value={currentItem.taxRateId}
                                            onValueChange={(val) => setCurrentItem({ ...currentItem, taxRateId: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Tax" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {taxRates?.map((rate) => (
                                                    <SelectItem key={rate.id} value={rate.id}>
                                                        {rate.name} ({rate.percentage}%)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                        id="item-tax-inclusive"
                                        checked={currentItem.isTaxInclusive}
                                        onCheckedChange={(checked) => setCurrentItem({ ...currentItem, isTaxInclusive: checked })}
                                    />
                                    <Label htmlFor="item-tax-inclusive">Tax Inclusive Price</Label>
                                </div>

                                <Button onClick={addItem} className="w-full md:w-auto">
                                    <Plus className="h-4 w-4 mr-2" /> Add Item
                                </Button>
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

                            {/* Footer / Total / Payment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-md">
                                <div>
                                    <Label>Notes</Label>
                                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." rows={3} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-lg">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                        <Label className="text-base whitespace-nowrap">Paid Amount:</Label>
                                        <FloatingLabelInput
                                            id="paid_amount"
                                            label="Amount"
                                            type="number"
                                            min="0"
                                            max={totalAmount}
                                            value={paidAmount}
                                            onChange={e => setPaidAmount(Number(e.target.value))}
                                            className="w-32 text-right"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-lg pt-2 border-t border-gray-300">
                                        <span className="font-bold">Balance Due:</span>
                                        <span className={`font-bold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ₹{balanceDue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" onClick={() => navigate("/sell/invoice")}>Cancel</Button>
                                <Button size="lg" onClick={handleSubmit} disabled={createSale.isPending}>
                                    {createSale.isPending ? "Creating..." : "Create Invoice"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </PageLayout >
    );
};

export default AddSalesInvoice;
