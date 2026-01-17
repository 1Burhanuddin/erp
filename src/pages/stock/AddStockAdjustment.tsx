import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateStockAdjustment } from "@/api/inventory";
import { useProducts } from "@/api/products";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const AddStockAdjustment = () => {
    const navigate = useNavigate();
    const { data: products } = useProducts();
    const createAdjustment = useCreateStockAdjustment();

    // Form State
    const [referenceNo, setReferenceNo] = useState(`ADJ-${Date.now()}`);
    const [adjustmentDate, setAdjustmentDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [reason, setReason] = useState("Stock Take");
    const [notes, setNotes] = useState("");

    // Item State (Single item for now as per previous simple logic, can be expanded to multi-item later)
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [type, setType] = useState<"Increase" | "Decrease">("Increase");

    const handleCreate = async () => {
        if (!selectedProduct || quantity <= 0) {
            toast.error("Please select a product and valid quantity");
            return;
        }

        try {
            await createAdjustment.mutateAsync({
                adjustment: {
                    reference_no: referenceNo,
                    adjustment_date: adjustmentDate,
                    reason,
                    notes,
                },
                items: [
                    {
                        product_id: selectedProduct,
                        quantity: quantity,
                        type: type,
                    },
                ],
            });
            toast.success("Stock adjustment created successfully");
            navigate("/stock/adjustment");
        } catch (error) {
            toast.error("Failed to create adjustment");
            console.error(error);
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="New Stock Adjustment"
                description="Create a new stock adjustment record"
                actions={
                    <Button variant="ghost" onClick={() => navigate("/stock/adjustment")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                }
            />

            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Reference No</Label>
                        <Input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={adjustmentDate} onChange={(e) => setAdjustmentDate(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Reason</Label>
                    <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Stock Take">Stock Take</SelectItem>
                            <SelectItem value="Damaged">Damaged</SelectItem>
                            <SelectItem value="Theft">Theft</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                    <h4 className="font-medium text-sm">Adjustment Item</h4>
                    <div className="space-y-2">
                        <Label>Product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                                {products?.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} (Cur: {p.current_stock})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Increase">Increase (+)</SelectItem>
                                    <SelectItem value="Decrease">Decrease (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => navigate("/stock/adjustment")}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createAdjustment.isPending}>
                        {createAdjustment.isPending ? "Creating..." : "Save Adjustment"}
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
};

export default AddStockAdjustment;
