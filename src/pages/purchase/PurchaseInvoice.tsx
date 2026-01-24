import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { usePurchaseOrders } from "@/api/purchase";
import { SearchInput } from "@/components/shared";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!mounted || !container) return null;

        return createPortal(
            <div className="flex items-center gap-2">
                <div className="hidden sm:block w-40 md:w-60">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Search invoices..."
                    />
                </div>
                <Button variant="outline" size="sm" className="h-9 px-2 sm:px-4">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Filter</span>
                </Button>
            </div>,
            container
        );
    };

    return (
        <PageLayout>
            <HeaderActions />
            <PageHeader
                title="Purchase Invoices"
                description="Manage and view purchase invoices"
            />

            <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden mt-4">
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
                                <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : filteredOrders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No invoices found</TableCell>
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
        </PageLayout>
    );
};

export default PurchaseInvoice;
