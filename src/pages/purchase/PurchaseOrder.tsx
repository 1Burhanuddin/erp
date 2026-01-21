import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
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
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    return (
        <PageLayout>
            <PageHeader
                title="Purchase Orders"
                description="Manage your purchase orders"
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                        </div>
                        <Button onClick={() => navigate("/purchase/add")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Purchase Order
                        </Button>
                    </div>
                }
            />

            {/* Mobile View Toggle */}
            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : orders?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No purchase orders found.</div>
                        ) : (
                            orders?.map((order: any) => (
                                <DataCard key={order.id} onClick={() => navigate(`/purchase/edit/${order.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{order.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{order.supplier?.name || "Unknown"}</p>
                                        </div>
                                        <div className="font-medium">
                                            ₹{order.total_amount?.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t text-sm text-muted-foreground flex justify-between items-center">
                                        <span>{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</span>
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
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
                                        <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/purchase/edit/${order.id}`)}>
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
                )}
            </div>
        </PageLayout>
    );
};

export default PurchaseOrder;
