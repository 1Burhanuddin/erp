import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
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
import { Skeleton } from "@/components/ui/skeleton";

const SaleReturn = () => {
    const navigate = useNavigate();
    const { data: returns, isLoading } = useSaleReturns();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!mounted || !container) return null;

        return createPortal(
            <div className="flex items-center gap-2">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                <Button onClick={() => navigate("/sell/return/add")} size="sm" className="h-9">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Return</span>
                </Button>
            </div>,
            container
        );
    };

    return (
        <PageLayout>
            <HeaderActions />
            <PageHeader
                title="Sales Returns"
                description="Manage customer returns and credit notes"
            />

            {/* Mobile View Toggle */}
            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-xl" />
                            ))
                        ) : returns && returns.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No returns found.</div>
                        ) : (
                            returns?.map((ret: any) => (
                                <DataCard key={ret.id} onClick={() => navigate(`/sell/return/${ret.id}`)} className="cursor-pointer transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{ret.sale?.order_no || "-"}</h3>
                                            <p className="text-sm text-muted-foreground">{ret.sale?.customer?.name || "-"}</p>
                                        </div>
                                        <span className="font-medium text-red-600">
                                            ₹{ret.total_refund_amount?.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t text-sm flex justify-between items-center">
                                        <span className="text-muted-foreground">{format(new Date(ret.return_date), "dd MMM yyyy")}</span>
                                        <span className="text-muted-foreground italic truncate max-w-[150px]">{ret.reason}</span>
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden">
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
                )}
            </div>
        </PageLayout>
    );
};

export default SaleReturn;
