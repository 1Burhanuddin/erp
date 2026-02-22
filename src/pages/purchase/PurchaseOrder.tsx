import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataCard } from "@/components/shared";
import { ListingLayout } from "@/components/layout/ListingLayout";
import { usePurchaseOrders } from "@/api/purchase";
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
    ) || [];

    const handleExportCSV = () => {
        if (!orders || orders.length === 0) {
            toast.error("No orders to export");
            return;
        }

        downloadCSV(
            orders,
            ["Order No", "Supplier", "Date", "Total Amount"],
            (o: any) => [
                o.order_no || "",
                o.supplier?.name || "",
                o.order_date ? format(new Date(o.order_date), "yyyy-MM-dd") : "",
                o.total_amount?.toString() || "0"
            ],
            "purchase_orders_export.csv"
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
            <Button variant="outline" className="h-10 px-2 sm:px-4" onClick={() => navigate("/purchase/import")}>
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
                searchPlaceholder="Search orders..."
                onAdd={() => navigate("/purchase/add")}
                addLabel="Create Order"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                headerActions={headerActions}
                tabs={[
                    { id: 'all', label: 'All Orders', icon: ShoppingCart, count: orders.length }
                ]}
                activeTab="all"
            >
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
            </ListingLayout>
        </PageLayout>
    );
};

export default PurchaseOrder;
