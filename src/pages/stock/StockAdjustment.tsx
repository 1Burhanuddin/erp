import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
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
import { useStockAdjustments } from "@/api/inventory";
import { format } from "date-fns";

const StockAdjustment = () => {
    const navigate = useNavigate();
    const { data: adjustments, isLoading } = useStockAdjustments();

    return (
        <PageLayout>
            <PageHeader
                title="Stock Adjustments"
                description="Manage stock adjustments"
                actions={
                    <Button onClick={() => navigate("/stock/adjustment/add")}>
                        <Plus className="mr-2 h-4 w-4" /> New Adjustment
                    </Button>
                }
            />

            <div className="bg-white rounded-md shadow mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Ref No</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : adjustments && adjustments.length > 0 ? (
                            adjustments.map((adj: any) => (
                                <TableRow
                                    key={adj.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/stock/adjustment/${adj.id}`)}
                                >
                                    <TableCell>{format(new Date(adj.adjustment_date), "dd MMM yyyy")}</TableCell>
                                    <TableCell className="font-medium">{adj.reference_no}</TableCell>
                                    <TableCell>{adj.reason}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {adj.items?.map((item: any) => (
                                                <div key={item.id} className={item.type === 'Increase' ? 'text-green-600' : 'text-red-600'}>
                                                    {item.quantity} {item.product?.name} ({item.type === 'Increase' ? '+' : '-'})
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {format(new Date(adj.created_at), "dd MMM yyyy HH:mm")}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                    No stock adjustments found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </PageLayout>
    );
};

export default StockAdjustment;
