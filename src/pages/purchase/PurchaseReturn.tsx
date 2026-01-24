import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { usePurchaseReturns } from "@/api/purchaseReturns";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const PurchaseReturn = () => {
    const navigate = useNavigate();
    const { data: returns, isLoading } = usePurchaseReturns();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!mounted || !container) return null;

        return createPortal(
            <Button onClick={() => navigate("/purchase/return/add")} size="sm" className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">New Return</span>
            </Button>,
            container
        );
    };

    return (
        <PageLayout>
            <HeaderActions />
            <PageHeader
                title="Purchase Returns"
                description="Manage returns to suppliers"
            />

            <div className="p-4">
                <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>PO Reference</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-right">Refund Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
                            ) : !returns || returns.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No returns found.</TableCell></TableRow>
                            ) : (
                                returns.map((ret: any) => (
                                    <TableRow key={ret.id}>
                                        <TableCell>{format(new Date(ret.return_date), "dd MMM yyyy")}</TableCell>
                                        <TableCell className="font-mono">{ret.purchase?.order_no}</TableCell>
                                        <TableCell>{ret.purchase?.supplier?.name}</TableCell>
                                        <TableCell>{ret.reason}</TableCell>
                                        <TableCell className="text-right font-medium">₹{ret.total_refund_amount?.toFixed(2)}</TableCell>
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

export default PurchaseReturn;
