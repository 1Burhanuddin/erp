import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, Plus } from "lucide-react";
import { useContacts } from "@/api/contacts";
import { useProducts } from "@/api/products";
import { useCreateDirectPurchase } from "@/api/purchase";
import { useTaxRates } from "@/api/taxRates";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "@/components/contacts/ContactForm";
import { ProductForm } from "@/components/products/ProductForm";
import { useCreateContact } from "@/api/contacts";
import { useCreateProduct } from "@/api/products";

const DirectPurchase = () => {
    const navigate = useNavigate();
    const { data: suppliers } = useContacts();
    const { data: products } = useProducts();
    const { data: taxRates } = useTaxRates();
    const createDirectPurchase = useCreateDirectPurchase();
    const createContact = useCreateContact();
    const createProduct = useCreateProduct();

    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    const [supplierId, setSupplierId] = useState("");
    const [orderNo, setOrderNo] = useState(`DP-${Date.now()}`); // Auto-generate
    const [items, setItems] = useState<any[]>([]);

    // Quick Add Item State
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

    const handleSupplierCreate = async (data: any) => {
        try {
            const newSupplier = await createContact.mutateAsync({ ...data, role: 'Supplier' });
            toast.success("Supplier added");
            setIsAddSupplierOpen(false);
            setSupplierId(newSupplier.id);
        } catch (error) {
            toast.error("Failed to add supplier");
        }
    };

    const handleProductCreate = async (data: any) => {
        try {
            const newProduct = await createProduct.mutateAsync({
                ...data,
                category_id: data.category_id || null,
                brand_id: data.brand_id || null,
                unit_id: data.unit_id || null
            });
            toast.success("Product added");
            setIsAddProductOpen(false);
            // We need to wait a tick for the product list to update via Query Client invalidation 
            // OR manually inject. Usually React Query + auto-select needs a bit of care.
            // For now, setting ID. If the list updates fast enough from props, it works.
            setCurrentItem(prev => ({ ...prev, productId: newProduct.id }));

            // Trigger price update manually since product might not be in 'products' list yet if not refetched
            setCurrentItem(prev => ({
                ...prev,
                productId: newProduct.id,
                unitPrice: newProduct.purchase_price || 0
            }));
        } catch (error) {
            toast.error("Failed to add product");
        }
    };

    const addItem = () => {
        if (!currentItem.productId) return toast.error("Select product");

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
        setCurrentItem({ productId: "", quantity: 1, unitPrice: 0, taxRateId: "" });
    };

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const handleSubmit = async () => {
        if (!supplierId) return toast.error("Select supplier");
        if (items.length === 0) return toast.error("Add items");

        try {
            await createDirectPurchase.mutateAsync({
                order: {
                    order_no: orderNo,
                    supplier_id: supplierId,
                    order_date: format(new Date(), "yyyy-MM-dd"), // Today
                    total_amount: totalAmount,
                    status: 'Received', // Explicitly received
                    notes: 'Direct Purchase'
                } as any,
                items: items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    subtotal: item.subtotal,
                    tax_rate_id: item.taxRateId || null,
                    tax_amount: item.taxAmount,
                    // purchase_id added by hook
                }))
            });
            toast.success("Direct Purchase Completed & Stock Updated!");
            navigate("/purchase/grn"); // Redirect to GRN list to see it in history
        } catch (error) {
            toast.error("Failed to complete direct purchase");
        }
    };

    return (
        <PageLayout>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-2 md:p-4">
                {/* Left: Input Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border rounded-xl shadow-sm p-3 md:p-6 space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Supplier <span className="text-destructive">*</span></Label>
                                <div className="flex gap-2">
                                    <Select value={supplierId} onValueChange={setSupplierId}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select Supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supplierList?.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => setIsAddSupplierOpen(true)} title="Add New Supplier">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
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

                        <div className="border rounded-xl p-3 md:p-4 bg-muted/20">
                            <h3 className="font-semibold mb-3 text-base md:text-lg">Add Items</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                    <Label>Product <span className="text-destructive">*</span></Label>
                                    <div className="flex gap-2">
                                        <Select value={currentItem.productId} onValueChange={handleProductChange}>
                                            <SelectTrigger className="flex-1"><SelectValue placeholder="Product" /></SelectTrigger>
                                            <SelectContent>
                                                {products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon" onClick={() => setIsAddProductOpen(true)} title="Add New Product">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-end">
                                    <div className="space-y-2">
                                        <FloatingLabelInput
                                            id="quantity"
                                            label="Qty"
                                            type="number"
                                            min="1"
                                            value={currentItem.quantity}
                                            onChange={e => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <FloatingLabelInput
                                            id="cost"
                                            label="Cost"
                                            type="number"
                                            value={currentItem.unitPrice}
                                            onChange={e => setCurrentItem({ ...currentItem, unitPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <Button className="w-full" onClick={addItem}>Add</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                        <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Product</TableHead>
                                            <TableHead className="font-semibold text-center">Qty</TableHead>
                                            <TableHead className="font-semibold text-right">Cost</TableHead>
                                            <TableHead className="font-semibold text-right">Total</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, idx) => (
                                            <TableRow key={idx} className="hover:bg-muted/30">
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-semibold">₹{item.subtotal.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            const n = [...items]; n.splice(idx, 1); setItems(n);
                                                        }}
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
                    <div className="bg-card border rounded-xl shadow-sm p-4 md:p-6 space-y-4 md:space-y-6 lg:sticky lg:top-4">
                        <h3 className="text-lg md:text-xl font-bold border-b pb-2">Purchase Summary</h3>
                        <div className="space-y-3 text-base md:text-lg">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total items:</span>
                                <span className="font-semibold">{items.length}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl md:text-2xl text-primary pt-2 border-t">
                                <span>Total:</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={createDirectPurchase.isPending}>
                            {createDirectPurchase.isPending ? "Processing..." : "Confirm Purchase"}
                        </Button>
                    </div>
                </div>
            </div>
            <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <ContactForm onSubmit={handleSupplierCreate} isSubmitting={createContact.isPending} />
                </DialogContent>
            </Dialog>

            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm onSubmit={handleProductCreate} isSubmitting={createProduct.isPending} />
                </DialogContent>
            </Dialog>
        </PageLayout >
    );
};

export default DirectPurchase;
