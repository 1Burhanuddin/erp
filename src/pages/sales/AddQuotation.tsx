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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateQuotation } from "@/api/sales";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useStores } from "@/api/stores";
import { useTaxRates } from "@/api/taxRates";

interface LineItem {
    id: string; // temp id for UI
    product_id: string;
    quantity: number;
    unit_price: number;
    tax_rate_id: string;
    tax_amount: number;
    subtotal: number;
}

const AddQuotation = () => {
    const navigate = useNavigate();
    const createQuotation = useCreateQuotation();
    const { data: contacts = [] } = useContacts();
    const { data: products = [] } = useProducts();
    const { data: stores } = useStores();
    const currentStore = stores?.[0];
    const { data: taxRates } = useTaxRates(currentStore?.id);

    const [formData, setFormData] = useState({
        customer_id: "",
        order_date: new Date().toISOString().split("T")[0],
        order_no: `QTN-${Date.now()}`, // Simple auto-gen
        notes: "",
    });

    const [items, setItems] = useState<LineItem[]>([
        { id: "1", product_id: "", quantity: 1, unit_price: 0, tax_rate_id: "", tax_amount: 0, subtotal: 0 }
    ]);

    // Update item and recalculate subtotal
    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                // If product changed, update price
                if (field === "product_id") {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        updated.unit_price = product.sale_price || 0;
                    }
                }

                // If tax rate changed or price/qty changed, recalculate tax
                let taxAmount = 0;
                const taxRateId = field === "tax_rate_id" ? value : updated.tax_rate_id;

                if (taxRateId) {
                    const rate = taxRates?.find(r => r.id === taxRateId);
                    if (rate) {
                        taxAmount = (updated.unit_price * updated.quantity * rate.percentage) / 100;
                    }
                }
                updated.tax_amount = taxAmount;

                // Recalculate subtotal
                updated.subtotal = (updated.quantity * updated.unit_price) + taxAmount;
                return updated;
            }
            return item;
        }));
    };

    const addItem = () => {
        setItems([
            ...items,
            { id: Date.now().toString(), product_id: "", quantity: 1, unit_price: 0, tax_rate_id: "", tax_amount: 0, subtotal: 0 }
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

        createQuotation.mutate({
            order: {
                ...formData,
                total_amount: calculateTotal(),
                status: "Quotation"
            },
            items: validItems
        }, {
            onSuccess: () => {
                toast.success("Quotation created successfully");
                navigate("/sales/quotations");
            },
            onError: (error) => {
                toast.error("Failed to create quotation: " + error.message);
            }
        });
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-7">
                        <CardTitle>Create Quotation</CardTitle>
                        <CardDescription>Create a new sales quotation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Header Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="order_no"
                                        label="Quotation No."
                                        value={formData.order_no}
                                        onChange={(e) => setFormData({ ...formData, order_no: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
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
                                <div className="space-y-1.5">
                                    <FloatingLabelInput
                                        id="order_date"
                                        type="date"
                                        label="Date"
                                        value={formData.order_date}
                                        onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                        required
                                        className="pt-4" // Ensure date input text alignment if needed
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md font-medium text-sm">
                                    <div className="flex-1 px-2">Product</div>
                                    <div className="w-20 px-2">Qty</div>
                                    <div className="w-28 px-2">Price</div>
                                    <div className="w-32 px-2">Tax</div>
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
                                        <div className="w-20">
                                            <FloatingLabelInput
                                                id={`qty-${item.id}`}
                                                label="Qty"
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="w-28">
                                            <FloatingLabelInput
                                                id={`price-${item.id}`}
                                                label="Price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Select
                                                value={item.tax_rate_id}
                                                onValueChange={(value) => updateItem(item.id, "tax_rate_id", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tax" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {taxRates?.map((rate) => (
                                                        <SelectItem key={rate.id} value={rate.id}>
                                                            {rate.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-32">
                                            <FloatingLabelInput
                                                id={`subtotal-${item.id}`}
                                                label="Total"
                                                value={item.subtotal.toFixed(2)}
                                                readOnly
                                                className="bg-muted pt-4"
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
                                        <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/sales/quotations")}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="w-full" disabled={createQuotation.isPending}>
                                            {createQuotation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Quotation
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

export default AddQuotation;
