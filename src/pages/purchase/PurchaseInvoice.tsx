import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { usePurchaseOrders } from "@/api/purchase";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { DataCard, ResponsivePageActions } from "@/components/shared";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Search, Filter, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const PurchaseInvoice = () => {
    const navigate = useNavigate();
    const { data: orders, isLoading } = usePurchaseOrders();
    const [search, setSearch] = useState("");
    const [mounted, setMounted] = useState(false);

    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // In this system, any Purchase Order can be considered having an invoice.
    // Specially those with status 'Received' or 'Completed'.
    // We filter for essentially all POs, but typically invoices are for Received goods.
    const filteredOrders = orders?.filter(order =>
    (order.order_no.toLowerCase().includes(search.toLowerCase()) ||
        order.supplier?.name.toLowerCase().includes(search.toLowerCase()))
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Received': return 'default';
            case 'Pending': return 'secondary';
            case 'Completed': return 'default';
            default: return 'outline';
        }
    };



    // ...

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <ExpandableSearch
                        value={search}
                        onChange={setSearch}
                        placeholder="Search invoices..."
                        className="w-full sm:w-auto"
                    />
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button variant="outline" size="sm" className="h-9 px-2 sm:px-4">
                            <Filter className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Filter</span>
                        </Button>
                        <ResponsivePageActions
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            onAdd={() => navigate("/purchase/invoice/add")}
                            addLabel="Create Invoice"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {isLoading ? (
                        <div className="col-span-full text-center py-8">Loading...</div>
                    ) : filteredOrders?.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground">No invoices found.</div>
                    ) : (
                        filteredOrders?.map((order) => (
                            <DataCard
                                key={order.id}
                                onClick={() => navigate(`/purchase/invoice/${order.id}`)}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-base">{order.order_no}</h3>
                                        <p className="text-sm text-muted-foreground">{order.supplier?.name}</p>
                                    </div>
                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        {format(new Date(order.created_at), "dd MMM yyyy")}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Total Amount</p>
                                        <p className="font-bold text-primary text-lg">₹{order.total_amount?.toFixed(2)}</p>
                                    </div>
                                </div>
                            </DataCard>
                        ))
                    )}
                </div>
            ) : (
                <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice / PO #</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : filteredOrders?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No invoices found</TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders?.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/purchase/invoice/${order.id}`)}
                                    >
                                        <TableCell className="font-medium">{order.order_no}</TableCell>
                                        <TableCell>{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
                                        <TableCell>{order.supplier?.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            ₹{order.total_amount?.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </PageLayout>
    );
};

export default PurchaseInvoice;
