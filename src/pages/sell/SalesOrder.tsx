import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useSalesOrders } from "@/api/sales";
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

import { ExpandableSearch } from "@/components/ui/expandable-search";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SalesOrder = () => {
    const { data: salesOrders, isLoading } = useSalesOrders();

    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const filteredOrders = salesOrders?.filter(order =>
        // In this system, 'Pending' = Sales Order
        order.status === 'Pending' &&
        (!searchQuery.trim() ||
            order.order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return "warning";
            case 'Completed': return "success";
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
                            placeholder="Search sales orders..."
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
                            onClick={() => navigate("/sell/order/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Order
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 w-full rounded-xl" />
                            ))
                        ) : filteredOrders?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No pending sales orders found.</div>
                        ) : (
                            filteredOrders?.map((sale: any) => (
                                <DataCard key={sale.id} onClick={() => { }} className="transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground font-mono">{sale.order_no}</h3>
                                            <p className="text-sm text-muted-foreground">{sale.customer?.name || "Unknown"}</p>
                                        </div>
                                        <Chip
                                            label={sale.status}
                                            size="small"
                                            color={getStatusColor(sale.status) as any}
                                            className="h-5 text-[10px]"
                                        />
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</span>
                                        <span className="font-medium">₹{sale.total_amount?.toFixed(2)}</span>
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
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Status</TableCell>
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
                                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                <TableCell align="right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredOrders?.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                No pending sales orders found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders?.map((sale: any) => (
                                            <TableRow
                                                key={sale.id}
                                                hover
                                                className="cursor-pointer"
                                            >
                                                <TableCell className="font-mono text-muted-foreground">{sale.order_no}</TableCell>
                                                <TableCell className="font-medium">{sale.customer?.name || "Unknown"}</TableCell>
                                                <TableCell>{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={sale.status}
                                                        size="small"
                                                        color={getStatusColor(sale.status) as any}
                                                        className="h-6 text-xs"
                                                    />
                                                </TableCell>
                                                <TableCell align="right" className="font-medium">
                                                    ₹{sale.total_amount?.toFixed(2)}
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

export default SalesOrder;

