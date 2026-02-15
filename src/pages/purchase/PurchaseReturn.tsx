import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout";
import { usePurchaseReturns } from "@/api/purchaseReturns";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { DataCard, ResponsivePageActions } from "@/components/shared";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

import { Upload, Download } from "lucide-react";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    ) || [];

    const handleExportCSV = () => {
        if (!returns || returns.length === 0) {
            toast.error("No returns to export");
            return;
        }

        downloadCSV(
            returns,
            ["Date", "PO Reference", "Supplier", "Reason", "Refund Amount"],
            (r: any) => [
                r.return_date ? format(new Date(r.return_date), "yyyy-MM-dd") : "",
                r.purchase?.order_no || "",
                r.purchase?.supplier?.name || "",
                r.reason || "",
                r.total_refund_amount?.toString() || "0"
            ],
            "purchase_returns_export.csv"
        );
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);



    // ...

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <ExpandableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        renderInline={true}
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 px-2 sm:px-4">
                                    <Download className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleExportCSV}>
                                    Export as CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" className="h-10 px-2 sm:px-4" onClick={() => navigate("/purchase/return/import")}>
                            <Upload className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Import</span>
                        </Button>
                        <ResponsivePageActions
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            onAdd={() => navigate("/purchase/return/add")}
                            addLabel="Create Return"
                        />
                    </div>
                </div>
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
