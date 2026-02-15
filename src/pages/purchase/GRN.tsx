import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataCard, ResponsivePageActions } from "@/components/shared";
import { usePurchaseOrders, useConvertPOToGRN } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const GRN = () => {
    const { data: allOrders, isLoading } = usePurchaseOrders();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Filter locally
    const filteredAll = allOrders?.filter((o: any) =>
        !searchQuery.trim() ||
        o.order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const pendingOrders = filteredAll.filter((o: any) => o.status === 'Pending');
    const receivedOrders = filteredAll.filter((o: any) => o.status === 'Received');

    const convertToGRN = useConvertPOToGRN();
    const navigate = useNavigate();

    const handleReceive = async (id: string, orderNo: string) => {
        try {
            await convertToGRN.mutateAsync(id);
            toast.success(`Order ${orderNo} marked as Received (GRN Created) & Stock Updated`);
        } catch (error) {
            toast.error("Failed to convert to GRN");
        }
    };

    const OrdersList = ({ orders, isPending }: { orders: any[], isPending: boolean }) => {
        if (viewMode === 'card') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            No orders found.
                        </div>
                    ) : (
                        orders.map((order: any) => (
                            <DataCard key={order.id}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-base">{order.order_no}</h3>
                                        <p className="text-sm text-muted-foreground">{order.supplier?.name || "Unknown"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary">₹{order.total_amount?.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    {isPending ? (
                                        <Button
                                            size="sm"
                                            onClick={() => handleReceive(order.id, order.order_no)}
                                            disabled={convertToGRN.isPending}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Receive Goods
                                        </Button>
                                    ) : (
                                        <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg flex justify-center items-center font-medium border border-green-100">
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Received
                                        </div>
                                    )}
                                </div>
                            </DataCard>
                        ))
                    )}
                </div>
            );
        }

        return (
            <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PO No</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono">{order.order_no}</TableCell>
                                    <TableCell>{order.supplier?.name || "Unknown"}</TableCell>
                                    <TableCell>{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</TableCell>
                                    <TableCell className="text-right font-medium">₹{order.total_amount?.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        {isPending ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleReceive(order.id, order.order_no)}
                                                disabled={convertToGRN.isPending}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Receive Goods
                                            </Button>
                                        ) : (
                                            <span className="text-green-600 font-medium flex justify-center items-center">
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Received
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };



    // ...

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <ExpandableSearch
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search orders..."
                    />
                    <ResponsivePageActions
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />
                </div>
            </div>

            <div className="p-4 space-y-6">
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="pending">Pending Receipt ({pendingOrders.length})</TabsTrigger>
                        <TabsTrigger value="received">Received History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-4">
                        {isLoading ? <Skeleton className="h-48 w-full" /> : <OrdersList orders={pendingOrders} isPending={true} />}
                    </TabsContent>

                    <TabsContent value="received" className="mt-4">
                        {isLoading ? <Skeleton className="h-48 w-full" /> : <OrdersList orders={receivedOrders} isPending={false} />}
                    </TabsContent>
                </Tabs>
            </div>
        </PageLayout>
    );
};

export default GRN;
