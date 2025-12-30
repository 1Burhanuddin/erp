import { PageLayout, PageHeader } from "@/components/layout";
import { usePurchaseOrders } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const PurchaseOrder = () => {
    const { data: orders, isLoading } = usePurchaseOrders();
    const navigate = useNavigate();

    return (
        <PageLayout>
            <PageHeader
                title="Purchase Orders"
                description="Manage your purchase orders"
                actions={
                    <Button onClick={() => navigate("/purchase/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Purchase Order
                    </Button>
                }
            />

            <div className="p-4">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order No</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : orders?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No purchase orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders?.map((order: any) => (
                                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-mono">{order.order_no}</TableCell>
                                        <TableCell>{order.supplier?.name || "Unknown"}</TableCell>
                                        <TableCell>{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₹{order.total_amount?.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </PageLayout>
    );
};

export default PurchaseOrder;
