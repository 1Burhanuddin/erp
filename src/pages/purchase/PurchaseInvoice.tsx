import { useState } from "react";
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

    return (
        <PageLayout>
            <PageHeader
                title="Purchase Invoices"
                description="Manage and view purchase invoices"
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <div className="w-full sm:w-[220px]">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Search invoices..."
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-4">
                                <Filter className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Filter</span>
                            </Button>
                        </div>
                    </div>
                }
            />

            <div className="border rounded-md bg-card mt-4">
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
