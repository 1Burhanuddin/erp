import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, FileText, Package } from "lucide-react";
import { ExpandableSearch } from "@/components/ui/expandable-search";
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
import { DataViewToggle } from "@/components/shared/DataViewToggle";
import { DataCard } from "@/components/shared";

const StockAdjustment = () => {
    const navigate = useNavigate();
    const { data: rawAdjustments, isLoading } = useStockAdjustments();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const adjustments = rawAdjustments?.filter((adj: any) =>
        !searchQuery.trim() ||
        adj.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.reason?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Button onClick={() => navigate("/stock/adjustment/add")} size="sm" className="h-9">
                    <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">New Adjustment</span> <span className="sm:hidden">New</span>
                </Button>
            </div>,
            container
        );
    };

    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search adjustments..."
            />
            <HeaderActions />

            {/* Mobile View Toggle (Visible only on small screens) */}
            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {isLoading ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground">Loading...</div>
                    ) : adjustments && adjustments.length > 0 ? (
                        adjustments.map((adj: any) => (
                            <DataCard key={adj.id} onClick={() => navigate(`/stock/adjustment/${adj.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{adj.reference_no}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(adj.adjustment_date), "dd MMM yyyy")}</p>
                                            </div>
                                        </div>
                                        {/* You could add a status badge here if relevant */}
                                    </div>

                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Reason:</span> {adj.reason}
                                    </div>

                                    <div className="border-t pt-3 mt-1">
                                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                            <Package className="h-3 w-3" /> Modified Items
                                        </p>
                                        <div className="space-y-1">
                                            {adj.items?.slice(0, 3).map((item: any) => (
                                                <div key={item.id} className={`text-xs flex justify-between ${item.type === 'Increase' ? 'text-green-600' : 'text-red-600'}`}>
                                                    <span>{item.product?.name}</span>
                                                    <span>{item.type === 'Increase' ? '+' : '-'}{item.quantity}</span>
                                                </div>
                                            ))}
                                            {adj.items?.length > 3 && (
                                                <div className="text-xs text-muted-foreground italic">
                                                    +{adj.items.length - 3} more items
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </DataCard>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            {searchQuery ? `No adjustments found matching "${searchQuery}"` : "No stock adjustments found."}
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-3xl border-0 shadow-sm bg-card overflow-hidden mt-6">
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
            )}
        </PageLayout>
    );
};

export default StockAdjustment;
