import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSalesOrder, useUpdateDeliveryChallan, useDeleteDeliveryChallan } from "@/api/sales"; // Reuse useSalesOrder for fetching single
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LineItem {
    id: string; // temp id for UI
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

const EditDeliveryChallan = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: challan, isLoading: isLoadingChallan } = useSalesOrder(id || "");
    const updateChallan = useUpdateDeliveryChallan();
    const deleteChallan = useDeleteDeliveryChallan();
    const { data: contacts = [] } = useContacts();
    const { data: products = [] } = useProducts();

    const [formData, setFormData] = useState({
        customer_id: "",
        order_date: "",
        order_no: "",
        notes: "",
    });

    const [items, setItems] = useState<LineItem[]>([]);

    useEffect(() => {
        if (challan) {
            setFormData({
                customer_id: challan.customer_id || "",
                order_date: challan.order_date || "",
                order_no: challan.order_no || "",
                notes: challan.notes || "",
            });

            if (challan.items && challan.items.length > 0) {
                setItems(challan.items.map((item: any) => ({
                    id: Math.random().toString(),
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal
                })));
            } else {
                setItems([{ id: "1", product_id: "", quantity: 1, unit_price: 0, subtotal: 0 }]);
            }
        }
    }, [challan]);

    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                if (field === "product_id") {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        updated.unit_price = product.sale_price || 0;
                    }
                }

                updated.subtotal = updated.quantity * updated.unit_price;
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), product_id: "", quantity: 1, unit_price: 0, subtotal: 0 }
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(items.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!formData.customer_id) {
            toast.error("Please select a customer");
            return;
        }

        if (items.some(item => !item.product_id)) {
            toast.error("Please select products for all items");
            return;
        }

        const validItems = items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal
        }));

        updateChallan.mutate({
            id: id,
            order: {
                ...formData,
                total_amount: calculateTotal(),
            },
            items: validItems
        }, {
            onSuccess: () => {
                toast.success("Delivery Challan updated successfully");
                navigate("/sales/challans");
            },
            onError: (error) => {
                toast.error("Failed to update challan: " + error.message);
            }
        });
    };

    const handleDelete = () => {
        if (!id) return;
        deleteChallan.mutate(id, {
            onSuccess: () => {
                toast.success("Delivery Challan deleted successfully");
                navigate("/sales/challans");
            },
            onError: (error) => {
                toast.error("Failed to delete challan: " + error.message);
            }
        });
    }

    if (isLoadingChallan) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div className="space-y-1.5">
                            <CardTitle>Edit Delivery Challan</CardTitle>
                            <CardDescription>Update delivery challan details</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Challan
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the delivery challan.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                            {deleteChallan.isPending ? "Deleting..." : "Delete"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Header Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Challan No.</Label>
                                    <Input
                                        value={formData.order_no}
                                        onChange={(e) => setFormData({ ...formData, order_no: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Customer</Label>
                                    <Select
                                        value={formData.customer_id}
                                        onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contacts.map((contact: any) => (
                                                <SelectItem key={contact.id} value={contact.id}>
                                                    {contact.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.order_date}
                                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md font-medium text-sm">
                                    <div className="flex-1 px-2">Product</div>
                                    <div className="w-24 px-2">Qty</div>
                                    <div className="w-32 px-2">Price</div>
                                    <div className="w-32 px-2">Subtotal</div>
                                    <div className="w-10"></div>
                                </div>

                                {items.map((item, index) => (
                                    <div key={item.id} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Select
                                                value={item.product_id}
                                                onValueChange={(value) => updateItem(item.id, "product_id", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Product" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product: any) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                value={item.subtotal.toFixed(2)}
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="w-10 pb-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive/90"
                                                onClick={() => removeItem(item.id)}
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Item
                                </Button>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col md:flex-row justify-between gap-6 border-t pt-6">
                                <div className="flex-1">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Terms and conditions..."
                                        className="mt-2"
                                    />
                                </div>
                                <div className="w-full md:w-64 space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total</span>
                                        <span>₹{calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/sales/challans")}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="w-full" disabled={updateChallan.isPending}>
                                            {updateChallan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Challan
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default EditDeliveryChallan;
