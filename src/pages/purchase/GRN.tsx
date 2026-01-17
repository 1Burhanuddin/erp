import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataCard } from "@/components/shared";
import { usePurchaseOrders, useConvertPOToGRN } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GRN = () => {
    const { data: allOrders, isLoading } = usePurchaseOrders();
    // Filter locally
    const pendingOrders = allOrders?.filter((o: any) => o.status === 'Pending') || [];
    const receivedOrders = allOrders?.filter((o: any) => o.status === 'Received') || [];

    const convertToGRN = useConvertPOToGRN();
    const navigate = useNavigate();

    const handleReceive = async (id: string, orderNo: string) => {
        try {
            await convertToGRN.mutateAsync(id);
            toast.success(`Order ${orderNo} marked as Received (GRN Created) & Stock Updated`);
        } catch (error) {
            toast.error("Failed to convert to GRN");
        }
    };

    const OrdersTable = ({ orders, isPending }: { orders: any[], isPending: boolean }) => (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>PO No</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No orders found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map((order: any) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">{order.order_no}</TableCell>
                                <TableCell>{order.supplier?.name || "Unknown"}</TableCell>
                                <TableCell>{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                <TableCell className="text-right font-medium">₹{order.total_amount?.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                    {isPending ? (
                                        <Button
                                            size="sm"
                                            onClick={() => handleReceive(order.id, order.order_no)}
                                            disabled={convertToGRN.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Receive Goods
                                        </Button>
                                    ) : (
                                        <span className="text-green-600 font-medium flex justify-center items-center">
                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Received
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <PageLayout>
            <PageHeader
                title="Goods Received Note (GRN)"
                description="Manage pending and received orders"
            />

            <div className="p-4 space-y-6">
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="pending">Pending Receipt ({pendingOrders.length})</TabsTrigger>
                        <TabsTrigger value="received">Received History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-4">
                        {isLoading ? <Skeleton className="h-48 w-full" /> : <OrdersTable orders={pendingOrders} isPending={true} />}
                    </TabsContent>

                    <TabsContent value="received" className="mt-4">
                        {isLoading ? <Skeleton className="h-48 w-full" /> : <OrdersTable orders={receivedOrders} isPending={false} />}
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
};

export default GRN;
