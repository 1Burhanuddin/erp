import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useDeliveryChallans } from "@/api/sales";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
// MUI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
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
    ) || [];

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return "default";
            case 'Pending': return "warning";
            case 'Delivered': return "success";
            case 'Cancelled': return "error";
            default: return "default";
        }
    };

    return (
        <PageLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search challans..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                        <Button variant="outlined" color="primary" size="small" className="h-9 px-2 sm:px-4">
                            <Download className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => navigate("/sales/delivery-challans/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Challan
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-xl" />
                            ))
                        ) : challans.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No delivery challans found matching "${searchQuery}"` : "No delivery challans found."}
                            </div>
                        ) : (
                            challans.map((challan: any) => (
                                <DataCard key={challan.id} onClick={() => navigate(`/sales/challans/edit/${challan.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{challan.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{challan.customer?.name || "Unknown"}</p>
                                        </div>
                                        <Chip
                                            label={challan.status}
                                            size="small"
                                            color={getStatusColor(challan.status) as any}
                                            className="h-5 text-[10px]"
                                        />
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
                    <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Challan No</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell align="right">Total Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                                <TableCell align="right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : challans.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                {searchQuery ? `No delivery challans found matching "${searchQuery}"` : "No delivery challans found."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        challans.map((challan: any) => (
                                            <TableRow
                                                key={challan.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/sales/challans/edit/${challan.id}`)}
                                                hover
                                            >
                                                <TableCell>{challan.order_date ? format(new Date(challan.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                                <TableCell className="font-mono font-medium text-muted-foreground">{challan.order_no}</TableCell>
                                                <TableCell className="font-medium">{challan.customer?.name || "Unknown"}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ₹{challan.total_amount?.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={challan.status}
                                                        size="small"
                                                        color={getStatusColor(challan.status) as any}
                                                        className="h-6 text-xs"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}
            </div>
        </PageLayout>
    );
};

export default DeliveryChallans;
