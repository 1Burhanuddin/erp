
import { useState } from "react";
import { createPortal } from "react-dom";

import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useSalesOrders } from "@/api/sales";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
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

const SalesOrder = () => {
    const { data: salesOrders, isLoading } = useSalesOrders();

    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');


    const filteredOrders = salesOrders?.filter(order =>
        // In this system, 'Pending' = Sales Order
        order.status === 'Pending' &&
        (!searchQuery.trim() ||
            order.order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!container) return null;

        return createPortal(
            <div className="flex items-center gap-2">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>,
            container
        );
    };

    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search sales orders..."
            />
            <HeaderActions />

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => navigate("/sell/order/add")}
                    size="icon"
                    className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-xl" />
                            ))
                        ) : filteredOrders?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No pending sales orders found.</div>
                        ) : (
                            filteredOrders?.map((sale: any) => (
                                <DataCard key={sale.id} onClick={() => { }} className="transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{sale.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{sale.customer?.name || "Unknown"}</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {sale.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</span>
                                        <span className="font-medium">₹{sale.total_amount?.toFixed(2)}</span>
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
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
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
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredOrders?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No pending sales orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders?.map((sale: any) => (
                                        <TableRow
                                            key={sale.id}
                                            className="hover:bg-muted/50"
                                        >
                                            <TableCell className="font-mono">{sale.order_no}</TableCell>
                                            <TableCell>{sale.customer?.name || "Unknown"}</TableCell>
                                            <TableCell>{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {sale.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{sale.total_amount?.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout >
    );
};

export default SalesOrder;

