import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { usePurchaseReturns } from "@/api/purchaseReturns";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { DataCard, DataViewToggle } from "@/components/shared";
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
    const { data: rawReturns, isLoading } = usePurchaseReturns();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [mounted, setMounted] = useState(false);

    const returns = rawReturns?.filter((r: any) =>
        !searchQuery.trim() ||
        r.purchase?.order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.purchase?.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            </div>,
            container
        );
    };

    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
            />
            <HeaderActions />

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => navigate("/purchase/return/add")}
                    size="icon"
                    className="h-14 w-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            <div className="col-span-full text-center py-8">Loading...</div>
                        ) : !returns || returns.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No returns found.</div>
                        ) : (
                            returns.map((ret: any) => (
                                <DataCard key={ret.id}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-base">{ret.purchase?.supplier?.name}</h3>
                                            <p className="text-sm text-muted-foreground font-mono">{ret.purchase?.order_no}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600">₹{ret.total_refund_amount?.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(ret.return_date), "dd MMM yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <span className="text-muted-foreground">Reason: </span>
                                        <span className="font-medium">{ret.reason}</span>
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
                )}
            </div>
        </PageLayout>
    );
};

export default PurchaseReturn;
