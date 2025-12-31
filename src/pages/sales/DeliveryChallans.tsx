import { PageLayout, PageHeader } from "@/components/layout";
import { useDeliveryChallans } from "@/api/sales";
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

const DeliveryChallans = () => {
    const { data: challans, isLoading } = useDeliveryChallans();
    const navigate = useNavigate();

    return (
        <PageLayout>
            <PageHeader
                title="Delivery Challans"
                description="Manage delivery challans"
                actions={
                    <Button onClick={() => navigate("/sales/challans/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Challan
                    </Button>
                }
            />

            <div className="p-4">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Challan No</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : challans?.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No delivery challans found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                challans?.map((challan: any) => (
                                    <TableRow
                                        key={challan.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigate(`/sales/challans/edit/${challan.id}`)}
                                    >
                                        <TableCell>{challan.order_date ? format(new Date(challan.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                        <TableCell className="font-mono">{challan.order_no}</TableCell>
                                        <TableCell>{challan.customer?.name || "Unknown"}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₹{challan.total_amount?.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                                {challan.status}
                                            </span>
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

export default DeliveryChallans;
