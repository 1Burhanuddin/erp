import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCreatePurchaseReturn } from "@/api/purchaseReturns";
import { usePurchaseOrders, usePurchaseOrder } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Sub-component to fetch items
const OrderItemsSelector = ({ orderId, onCheck, onQtyChange, selectedItems }: any) => {
    const { data: order, isLoading } = usePurchaseOrder(orderId);

    if (isLoading) return <TableRow><TableCell colSpan={4}>Loading items...</TableCell></TableRow>;
    if (!order?.items || order.items.length === 0) return <TableRow><TableCell colSpan={4}>No items in this order.</TableCell></TableRow>;

    return (
        <>
            {order.items.map((item: any) => {
                const isChecked = selectedItems.some((i: any) => i.id === item.id);
                const returnQty = selectedItems.find((i: any) => i.id === item.id)?.returnQuantity || 1;

                return (
                    <TableRow key={item.id}>
                        <TableCell>
                            <Checkbox
                                checked={isChecked}
                                onCheckedChange={(chk) => onCheck(item, chk === true)}
                            />
                        </TableCell>
                        <TableCell>{item.product?.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                            {isChecked && (
                                <FloatingLabelInput
                                    id={`return-qty-${item.id}`}
                                    label="Qty"
                                    type="number"
                                    min="1"
                                    max={item.quantity}
                                    className="w-20 pt-4"
                                    value={returnQty}
                                    onChange={(e) => onQtyChange(item.id, Number(e.target.value))}
                                />
                            )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </>
    );
};

const AddPurchaseReturn = () => {
    const navigate = useNavigate();
    const { data: orders } = usePurchaseOrders();
    const createReturn = useCreatePurchaseReturn();

    // Form State
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [reason, setReason] = useState("");
    const [returnItems, setReturnItems] = useState<any[]>([]);

    const handleOrderSelect = (orderId: string) => {
        setSelectedOrderId(orderId);
        setReturnItems([]);
    };

    const selectedOrder = orders?.find(o => o.id === selectedOrderId);

    const handleItemCheck = (item: any, isChecked: boolean) => {
        if (isChecked) {
            setReturnItems([...returnItems, { ...item, returnQuantity: 1 }]);
        } else {
            setReturnItems(returnItems.filter(i => i.id !== item.id));
        }
    };

    const handleQuantityChange = (itemId: string, qty: number) => {
        setReturnItems(returnItems.map(i => i.id === itemId ? { ...i, returnQuantity: qty } : i));
    };

    const handleSubmit = async () => {
        if (!selectedOrderId) return toast.error("Select an order");
        if (returnItems.length === 0) return toast.error("Select items to return");
        if (!reason) return toast.error("Enter reason");

        const totalRefund = returnItems.reduce((sum, item) => sum + (item.unit_price * item.returnQuantity), 0);

        try {
            await createReturn.mutateAsync({
                returnBox: {
                    purchase_id: selectedOrderId,
                    return_date: format(new Date(), "yyyy-MM-dd"),
                    reason,
                    total_refund_amount: totalRefund
                },
                items: returnItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.returnQuantity,
                    refund_amount: item.unit_price * item.returnQuantity
                }))
            });
            toast.success("Return Processed & Stock Decreased");
            navigate("/purchase/return");
        } catch (error) {
            toast.error("Failed to process return");
        }
    };

    return (
        <PageLayout>
            <div className="mb-6">
                <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate("/purchase/return")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Returns
                </Button>
            </div>

            <PageHeader
                title="Create Purchase Return"
                description="Return received items to supplier"
            />

            <div className="grid gap-6 max-w-4xl">
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label>Select Purchase Order</Label>
                            <Select value={selectedOrderId} onValueChange={handleOrderSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PO..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {orders?.map(o => (
                                        <SelectItem key={o.id} value={o.id}>
                                            {o.order_no} - {o.supplier?.name} ({format(new Date(o.created_at), "dd MMM")})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedOrderId && (
                            <div className="border rounded-md p-4 bg-muted/20">
                                <h4 className="font-semibold mb-2">Select Items to Return</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Return</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Purchased Qty</TableHead>
                                            <TableHead>Return Qty</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <OrderItemsSelector
                                            orderId={selectedOrderId}
                                            onCheck={handleItemCheck}
                                            onQtyChange={handleQuantityChange}
                                            selectedItems={returnItems}
                                        />
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Reason for Return</Label>
                            <Textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason for returning items..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button size="lg" onClick={handleSubmit} disabled={createReturn.isPending}>
                                {createReturn.isPending ? "Processing..." : "Confirm Return"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddPurchaseReturn;
