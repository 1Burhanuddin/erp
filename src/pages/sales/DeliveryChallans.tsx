import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useDeliveryChallans } from "@/api/sales";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
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
    const { data: rawChallans, isLoading } = useDeliveryChallans();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const challans = rawChallans?.filter((c: any) =>
        !searchQuery.trim() ||
        c.order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const HeaderActions = () => {
        const container = document.getElementById('header-actions');
        if (!container) return null;

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
                placeholder="Search challans..."
            />
            <HeaderActions />

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => navigate("/sales/challans/add")}
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
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-xl" />
                            ))
                        ) : challans?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No delivery challans found matching "${searchQuery}"` : "No delivery challans found."}
                            </div>
                        ) : (
                            challans?.map((challan: any) => (
                                <DataCard key={challan.id} onClick={() => navigate(`/sales/challans/edit/${challan.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{challan.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{challan.customer?.name || "Unknown"}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                            {challan.status}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{challan.order_date ? format(new Date(challan.order_date), "dd MMM yyyy") : "-"}</span>
                                        <span className="font-medium">₹{challan.total_amount?.toFixed(2)}</span>
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
                                            {searchQuery ? `No delivery challans found matching "${searchQuery}"` : "No delivery challans found."}
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
                )}
            </div>
        </PageLayout>
    );
};

export default DeliveryChallans;
