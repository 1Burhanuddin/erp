import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useSalesOrders } from "@/api/sales";
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

const EcommerceSale = () => {
    // Fetch all, filter by channel 'Online'
    const { data: allSales, isLoading } = useSalesOrders();
    const sales = allSales?.filter((s: any) => s.channel === 'Online');

    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    return (
        <PageLayout>
            <PageHeader
                title="E-Commerce Sales"
                description="Manage online sales orders"
                // No 'Create' button here as Ecommerce sales usually come from external source or could be added manually if we add a 'Channel' selector to AddSalesInvoice. 
                // For now, it's a view.
                actions={
                    <div className="hidden sm:block">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                    </div>
                }
            />

            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-xl" />
                            ))
                        ) : sales?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No online sales found.</div>
                        ) : (
                            sales?.map((sale: any) => (
                                <DataCard key={sale.id} onClick={() => navigate(`/sell/invoice/${sale.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{sale.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{sale.customer?.name || "Unknown"}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                            }`}>
                                            {sale.payment_status}
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
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order No</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Payment</TableHead>
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
                                ) : sales?.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No online sales found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sales?.map((sale: any) => (
                                        <TableRow
                                            key={sale.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/sell/invoice/${sale.id}`)}
                                        >
                                            <TableCell className="font-mono">{sale.order_no}</TableCell>
                                            <TableCell>{sale.customer?.name || "Unknown"}</TableCell>
                                            <TableCell>{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sale.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                    }`}>
                                                    {sale.payment_status}
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
        </PageLayout>
    );
};

export default EcommerceSale;
