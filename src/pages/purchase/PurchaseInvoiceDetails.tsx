import { useParams, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { usePurchaseOrder } from "@/api/purchase";
import { useBusinessProfile } from "@/api/businessProfile";
import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

const PurchaseInvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: order, isLoading } = usePurchaseOrder(id!);
    const { data: businessProfile } = useBusinessProfile();
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        if (order && action === 'print') {
            setTimeout(() => {
                window.print();
            }, 500); // Small delay to ensure render
        }
    }, [order, action]);

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Invoice not found</div>;

    // Calculate Status Color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Received': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <PageLayout>
            <div className="print:hidden space-y-6">
                <PageHeader
                    title={`Invoice ${order.order_no}`}
                    description="View purchase invoice details"
                    actions={
                        <div className="flex gap-2 items-center">
                            <Button variant="ghost" onClick={() => navigate("/purchase/invoice")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                            </Button>
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>
                    }
                />

                <Tabs defaultValue="preview" className="space-y-4">
                    <TabsList className="w-full grid grid-cols-2">
                        <TabsTrigger value="preview">Invoice Preview</TabsTrigger>
                        <TabsTrigger value="items">Items & Cost</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview">
                        <div className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none print:border-none max-w-4xl mx-auto" id="printable-invoice">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">PURCHASE INVOICE</h1>
                                    <p className="text-gray-500 font-mono mt-1">{order.order_no}</p>
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-gray-900">Supplier:</h3>
                                        <p className="text-gray-700">{order.supplier?.name}</p>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{order.supplier?.address}</p>
                                        <p className="text-gray-600 text-sm">{order.supplier?.phone}</p>
                                        {order.supplier?.gstin && <p className="text-gray-600 text-sm">GSTIN: {order.supplier.gstin}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-semibold text-lg">{businessProfile?.company_name || "My Company Name"}</h3>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{businessProfile?.address || "Address Line 1"}</p>
                                    <div className="mt-6">
                                        <p className="text-gray-600">Date:</p>
                                        <p className="font-semibold">{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</p>
                                    </div>
                                    <div className="mt-2 text-right flex flex-col items-end gap-1">
                                        <p className="text-gray-600">Status:</p>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {order.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[40%]">Item</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Unit Price</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items?.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.product?.name}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right">₹{item.unit_price?.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">₹{item.subtotal?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end border-t pt-4">
                                <div className="w-1/2 md:w-1/3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-bold">₹{order.total_amount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="mt-8 border-t pt-4">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Notes:</h4>
                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="items">
                        <div className="bg-card rounded-md border p-4">
                            <h3 className="font-semibold mb-4">Item Details</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product?.name}</TableCell>
                                            <TableCell className="font-mono text-xs">{item.product?.sku || "-"}</TableCell>
                                            <TableCell>{item.product?.unit?.name || "-"}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">₹{item.unit_price?.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-medium">₹{item.subtotal?.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Print View */}
            <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">PURCHASE INVOICE</h1>
                            <p className="text-gray-500 font-mono mt-1">{order.order_no}</p>
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-900">Supplier:</h3>
                                <p className="text-gray-700">{order.supplier?.name}</p>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{order.supplier?.address}</p>
                                <p className="text-gray-600 text-sm">{order.supplier?.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-lg">{businessProfile?.company_name || "My Company Name"}</h3>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{businessProfile?.address || "Address Line 1"}</p>
                            <div className="mt-6">
                                <p className="text-gray-600">Date:</p>
                                <p className="font-semibold">{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Item</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.product?.name}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">₹{item.unit_price?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">₹{item.subtotal?.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                        <div className="w-1/2 md:w-1/3 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold">₹{order.total_amount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default PurchaseInvoiceDetails;
