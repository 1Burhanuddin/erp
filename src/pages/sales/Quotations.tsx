import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
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
    const { data: rawQuotations, isLoading } = useQuotations();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const quotations = rawQuotations?.filter((q: any) =>
        !searchQuery.trim() ||
        q.quotation_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);



    return (
        <PageLayout>
            <ExpandableSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search quotations..."
            />

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => navigate("/sales/quotations/add")}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
                        ) : quotations?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No quotations found matching "${searchQuery}"` : "No quotations found."}
                            </div>
                        ) : (
                            quotations?.map((q: any) => (
                                <DataCard key={q.id} onClick={() => navigate(`/sales/quotations/edit/${q.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{q.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{q.customer?.name || "Unknown"}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                            {q.status}
                                        </span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{format(new Date(q.order_date), "MMM d, yyyy")}</span>
                                        <span className="font-medium">₹{q.total_amount?.toFixed(2)}</span>
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
                                        <TableCell
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {searchQuery ? `No quotations found matching "${searchQuery}"` : "No quotations found."}
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
                )}
            </div>
        </PageLayout>
    );
};

export default Quotations;
