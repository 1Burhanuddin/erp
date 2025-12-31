import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuotations } from "@/api/sales";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const Quotations = () => {
    const navigate = useNavigate();
    const { data: quotations, isLoading, error } = useQuotations();

    if (error) return <div>Error loading quotations</div>;

    return (
        <PageLayout>
            <PageHeader
                title="Quotations"
                description="Manage sales quotations and estimates"
                actions={
                    <Button onClick={() => navigate("/sales/quotations/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Quotation
                    </Button>
                }
            />
            <div className="p-4 bg-card rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Quotation #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : quotations?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No quotations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotations?.map((q: any) => (
                                <TableRow
                                    key={q.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/sales/quotations/edit/${q.id}`)}
                                >
                                    <TableCell>{format(new Date(q.order_date), "MMM d, yyyy")}</TableCell>
                                    <TableCell className="font-medium">{q.order_no}</TableCell>
                                    <TableCell>{q.customer?.name || "Unknown"}</TableCell>
                                    <TableCell>₹{q.total_amount?.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                            {q.status}
                                        </span>
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

export default Quotations;
