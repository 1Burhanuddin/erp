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
import { useSaleReturns } from "@/api/returns";
import { format } from "date-fns";

const SaleReturn = () => {
    const navigate = useNavigate();
    const { data: returns, isLoading } = useSaleReturns();

    return (
        <PageLayout>
            <PageHeader
                title="Sales Returns"
                description="Manage customer returns and credit notes"
                actions={
                    <Button onClick={() => navigate("/sell/return/add")}>
                        <Plus className="mr-2 h-4 w-4" /> New Return
                    </Button>
                }
            />

            <div className="bg-white rounded-md shadow mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Order No</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Refund Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : returns && returns.length > 0 ? (
                            returns.map((ret: any) => (
                                <TableRow
                                    key={ret.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/sell/return/${ret.id}`)}
                                >
                                    <TableCell>{format(new Date(ret.return_date), "dd MMM yyyy")}</TableCell>
                                    <TableCell className="font-medium">{ret.sale?.order_no || "-"}</TableCell>
                                    <TableCell>{ret.sale?.customer?.name || "-"}</TableCell>
                                    <TableCell>{ret.reason}</TableCell>
                                    <TableCell className="text-right font-medium text-red-600">
                                        ₹{ret.total_refund_amount?.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                    No returns found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </PageLayout>
    );
};

export default SaleReturn;
