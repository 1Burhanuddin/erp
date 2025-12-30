import { PageLayout, PageHeader } from "@/components/layout";
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

const SalesInvoice = () => {
    const { data: sales, isLoading } = useSalesOrders();
    const navigate = useNavigate();

    return (
        <PageLayout>
            <PageHeader
                title="Sales Invoices"
                description="Manage your sales and invoices"
                actions={
                    <Button onClick={() => navigate("/sell/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                }
            />

            <div className="p-4">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice No</TableHead>
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
                                        No sales invoices found.
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
            </div>
        </PageLayout>
    );
};

export default SalesInvoice;
