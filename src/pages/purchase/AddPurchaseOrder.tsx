import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const AddPurchaseOrder = () => {
    const navigate = useNavigate();
    const { data: suppliers } = useContacts(); // We filter for suppliers in the render
    const { data: products } = useProducts();
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
        const newItem = {
            ...currentItem,
            productName: product?.name,
            subtotal: currentItem.quantity * currentItem.unitPrice
        };
        setItems([...items, newItem]);
        // Reset current item (keep quantity 1 for convenience)
        setCurrentItem({ productId: "", quantity: 1, unitPrice: 0 });
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
                    subtotal: item.subtotal
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
            <PageHeader
                title="Create Purchase Order"
                description="Create a new purchase order for a supplier"
            />

            <div className="p-6 bg-card rounded-lg border m-4 space-y-6">
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
                        <Label>Order Date</Label>
                        <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Order No.</Label>
                        <Input value={orderNo} onChange={e => setOrderNo(e.target.value)} />
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
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min="1"
                                value={currentItem.quantity}
                                onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                            />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <Label>Unit Cost</Label>
                            <Input
                                type="number"
                                min="0"
                                value={currentItem.unitPrice}
                                onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                            />
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
                                <TableHead className="text-right">Subtotal</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No items added yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{item.unitPrice.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{item.subtotal.toFixed(2)}</TableCell>
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
                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md">
                    <div className="w-1/2">
                        <Label>Notes</Label>
                        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." rows={2} />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">Total: ₹{calculateTotal().toFixed(2)}</div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => navigate("/purchase/order")}>Cancel</Button>
                    <Button size="lg" onClick={handleSubmit} disabled={createOrder.isPending}>
                        {createOrder.isPending ? "Creating..." : "Create Purchase Order"}
                    </Button>
                </div>

            </div>
        </PageLayout>
    );
};

export default AddPurchaseOrder;
