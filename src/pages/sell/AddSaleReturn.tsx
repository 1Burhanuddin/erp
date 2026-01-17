import { useState, useEffect } from "react";
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
import { useCreateSaleReturn } from "@/api/returns";
import { useSalesOrders, useSalesOrder } from "@/api/sales";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const AddSaleReturn = () => {
    const navigate = useNavigate();
    const createReturn = useCreateSaleReturn();
    const { data: salesOrders } = useSalesOrders();

    // Form State
    const [selectedSaleId, setSelectedSaleId] = useState("");
    const [returnDate, setReturnDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [reason, setReason] = useState("Damaged Goods");
    const [totalRefund, setTotalRefund] = useState(0);

    // Items State
    const [returnItems, setReturnItems] = useState<{
        product_id: string;
        product_name: string;
        sold_qty: number;
        unit_price: number;
        return_qty: number;
        isSelected: boolean;
    }[]>([]);

    // Fetch Details when Sale is selected
    const { data: selectedSale } = useSalesOrder(selectedSaleId);

    useEffect(() => {
        if (selectedSale && selectedSale.items) {
            const items = selectedSale.items.map((item: any) => ({
                product_id: item.product_id,
                product_name: item.product?.name,
                sold_qty: item.quantity,
                unit_price: item.unit_price,
                return_qty: 0,
                isSelected: false
            }));
            setReturnItems(items);
        }
    }, [selectedSale]);

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...returnItems];
        // @ts-ignore
        newItems[index][field] = value;

        // Auto calculate total refund if qty changes
        if (field === 'return_qty' || field === 'isSelected') {
            calculateTotalRefund(newItems);
        }
        setReturnItems(newItems);
    };

    const calculateTotalRefund = (items: any[]) => {
        const total = items.reduce((sum, item) => {
            if (item.isSelected && item.return_qty > 0) {
                return sum + (item.return_qty * item.unit_price);
            }
            return sum;
        }, 0);
        setTotalRefund(total);
    }

    const handleCreate = async () => {
        const selectedItems = returnItems.filter(i => i.isSelected && i.return_qty > 0);

        if (!selectedSaleId || selectedItems.length === 0) {
            toast.error("Please select an order and at least one item to return");
            return;
        }

        try {
            await createReturn.mutateAsync({
                returnBox: {
                    sale_id: selectedSaleId,
                    return_date: returnDate,
                    reason,
                    total_refund_amount: totalRefund,
                },
                items: selectedItems.map(i => ({
                    product_id: i.product_id,
                    quantity: i.return_qty,
                    refund_amount: i.return_qty * i.unit_price
                })),
            });
            toast.success("Return created successfully");
            navigate("/sell/return");
        } catch (error) {
            toast.error("Failed to create return");
            console.error(error);
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="New Sales Return"
                description="Process a customer return"
                actions={
                    <Button variant="ghost" onClick={() => navigate("/sell/return")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Button>
                }
            />

            <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Select Invoice / Order</Label>
                        <Select value={selectedSaleId} onValueChange={setSelectedSaleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Search Order..." />
                            </SelectTrigger>
                            <SelectContent>
                                {salesOrders?.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.order_no} - {s.customer?.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Return Date</Label>
                        <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Reason</Label>
                    <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Damaged Goods">Damaged Goods</SelectItem>
                            <SelectItem value="Incorrect Item">Incorrect Item</SelectItem>
                            <SelectItem value="Customer Changed Mind">Customer Changed Mind</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Items Selection Table */}
                {selectedSaleId && (
                    <div className="border rounded-md p-4">
                        <h4 className="mb-4 font-medium">Select Items to Return</h4>
                        <div className="space-y-4">
                            {returnItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-2 bg-slate-50 rounded border">
                                    <Checkbox
                                        checked={item.isSelected}
                                        onCheckedChange={(c) => handleItemChange(index, 'isSelected', c)}
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{item.product_name}</div>
                                        <div className="text-xs text-gray-500">Sold: {item.sold_qty} @ ₹{item.unit_price}</div>
                                    </div>
                                    <div className="w-32">
                                        <Label className="text-xs">Return Qty</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max={item.sold_qty}
                                            value={item.return_qty}
                                            disabled={!item.isSelected}
                                            onChange={(e) => handleItemChange(index, 'return_qty', Number(e.target.value))}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="w-24 text-right font-medium text-sm">
                                        ₹{(item.return_qty * item.unit_price).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end items-center gap-4 border-t pt-4">
                    <div className="text-lg font-bold">Total Refund: ₹{totalRefund.toFixed(2)}</div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => navigate("/sell/return")}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createReturn.isPending}>
                        {createReturn.isPending ? "Processing..." : "Create Return Note"}
                    </Button>
                </div>
            </div>
        </PageLayout>
    );
};

export default AddSaleReturn;
