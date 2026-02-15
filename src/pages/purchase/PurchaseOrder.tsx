import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { usePurchaseOrders } from "@/api/purchase";
import { ExpandableSearch } from "@/components/ui/expandable-search";
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
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const { data: rawOrders, isLoading } = usePurchaseOrders();
    // Basic filter
    const orders = rawOrders?.filter(o =>
        !searchQuery.trim() ||
        o.order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search orders..."
            />

            <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />

            <Button
                onClick={() => navigate("/purchase/add")}
                className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
                size="lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-medium text-base">Create Order</span>
            </Button>

            <div>
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : orders?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No purchase orders found.</div>
                        ) : (
                            orders?.map((order: any) => (
                                <DataCard key={order.id} onClick={() => navigate(`/purchase/edit/${order.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex flex-col gap-2 items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{order.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{order.supplier?.name || "Unknown"}</p>
                                        </div>
                                        <div className="font-medium text-lg">
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
                    <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
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
