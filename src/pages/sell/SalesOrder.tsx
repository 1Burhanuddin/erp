import { useState } from "react";
import { ListingLayout } from "@/components/layout/ListingLayout";
import { DataCard } from "@/components/shared";
import { useSalesOrders } from "@/api/sales";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Upload, Download } from "lucide-react";
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
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageLayout } from "@/components/layout";

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

    const handleExportCSV = () => {
        if (!filteredOrders || filteredOrders.length === 0) {
            toast.error("No orders to export");
            return;
        }

        downloadCSV(
            filteredOrders,
            ["Order No", "Customer", "Date", "Status", "Total Amount"],
            (order: any) => [
                order.order_no || "",
                order.customer?.name || "",
                order.order_date ? format(new Date(order.order_date), "yyyy-MM-dd") : "",
                order.status || "",
                order.total_amount?.toString() || "0"
            ],
            "sales_orders_export.csv"
        );
    };

    const headerActions = (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-2 sm:px-4">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                        Export as CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="h-10 px-2 sm:px-4" onClick={() => navigate("/sell/order/import")}>
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Import</span>
            </Button>
        </>
    );

    return (
        <PageLayout>
            <ListingLayout
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search sales orders..."
                onAdd={() => navigate("/sell/order/add")}
                addLabel="Add Order"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                headerActions={headerActions}
                tabs={[
                    { id: 'all', label: 'All Orders', icon: ShoppingCart, count: filteredOrders.length }
                ]}
                activeTab="all"
            >
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
                                <DataCard key={sale.id} onClick={() => { }} className="transition-colors cursor-pointer hover:border-primary/50">
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
                                            className="hover:bg-muted/50 cursor-pointer"
                                            onClick={() => { }}
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
            </ListingLayout>
        </PageLayout >
    );
};

export default SalesOrder;

