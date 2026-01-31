import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { usePurchaseOrders } from "@/api/purchase";
import { ExpandableSearch } from "@/components/ui/expandable-search";
// MUI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';

import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const PurchaseOrder = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const { data: rawOrders, isLoading } = usePurchaseOrders();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Basic filter
    const orders = rawOrders?.filter(o =>
        !searchQuery.trim() ||
        o.order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <PageLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search orders..."
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
                            onClick={() => navigate("/purchase/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Order
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-32 w-full rounded-xl" />
                            ))
                        ) : orders?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No purchase orders found.</div>
                        ) : (
                            orders?.map((order: any) => (
                                <DataCard key={order.id} onClick={() => navigate(`/purchase/edit/${order.id}`)} className="cursor-pointer hover:border-primary/50 transition-colors">
                                    <div className="flex flex-col gap-2 items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{order.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{order.supplier?.name || "Unknown"}</p>
                                        </div>
                                        <div className="font-medium text-lg">
                                            ₹{order.total_amount?.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t text-sm text-muted-foreground flex justify-between items-center">
                                        <span>{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</span>
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
                                        <TableCell>Order No</TableCell>
                                        <TableCell>Supplier</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Total Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell align="right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : orders?.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No purchase orders found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders?.map((order: any) => (
                                            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/purchase/edit/${order.id}`)}>
                                                <TableCell className="font-mono text-muted-foreground">{order.order_no}</TableCell>
                                                <TableCell className="font-medium">{order.supplier?.name || "Unknown"}</TableCell>
                                                <TableCell>{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                                <TableCell align="right" className="font-medium">
                                                    ₹{order.total_amount?.toFixed(2)}
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

export default PurchaseOrder;
