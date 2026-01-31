import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Plus, Package, FileText } from "lucide-react";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { useStockAdjustments } from "@/api/inventory";
import { format } from "date-fns";
import { DataViewToggle, DataCard } from "@/components/shared";
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
import Skeleton from '@mui/material/Skeleton';

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
    ) || [];

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    return (
        <PageLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search adjustments..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => navigate("/stock/adjustment/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Adjustment
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} variant="rectangular" height={160} className="w-full rounded-xl" />
                            ))
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
                    <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Ref No</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Items</TableCell>
                                        <TableCell>Created At</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={200} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : adjustments && adjustments.length > 0 ? (
                                        adjustments.map((adj: any) => (
                                            <TableRow
                                                key={adj.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/stock/adjustment/${adj.id}`)}
                                                hover
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
                        </TableContainer>
                    </Card>
                )}
            </div>
        </PageLayout>
    );
};

export default StockAdjustment;
