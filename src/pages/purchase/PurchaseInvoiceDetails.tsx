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
import { getTaxType, calculateTaxableAmount, calculateTotalTax, calculateItemTaxRate } from "@/utils/taxUtils";

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
    // Tax Logic
    // Tax Logic
    const supplierState = order.supplier?.state || order.supplier?.address?.split(',').pop()?.trim();
    const buyerState = businessProfile?.state;

    const isIntraState = getTaxType(supplierState, buyerState) === 'INTRA';
    const totalTaxable = calculateTaxableAmount(order.items || []);
    const totalTax = calculateTotalTax(order.items || []);

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
                                        {order.supplier?.state && <p className="text-gray-600 text-sm">State: {order.supplier.state}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-semibold text-lg">{businessProfile?.company_name || "My Company Name"}</h3>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{businessProfile?.address || "Address Line 1"}</p>
                                    {businessProfile?.gstin && <p className="text-gray-600 text-sm">GSTIN: {businessProfile.gstin}</p>}
                                    {businessProfile?.state && <p className="text-gray-600 text-sm">State: {businessProfile.state}</p>}
                                    <div className="mt-6">
                                        <p className="text-gray-600">Date:</p>
                                        <p className="font-semibold">{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</p>
                                        {buyerState && <p className="text-gray-600 mt-1">Place of Supply: <span className="font-semibold">{businessProfile?.state}</span></p>}
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
                                            <TableHead className="w-[35%]">Item</TableHead>
                                            <TableHead className="w-[10%]">HSN/SAC</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Rate</TableHead>
                                            <TableHead className="text-right w-[20%]">Tax</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items?.map((item: any) => {
                                            const taxRate = calculateItemTaxRate(item.tax_amount || 0, item.subtotal || 0);

                                            // Determine tax labels based on place of supply
                                            const isIGST = !isIntraState;

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.product?.name}</TableCell>
                                                    <TableCell className="text-sm text-gray-500">{item.product?.hsn_code || "-"}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">₹{item.unit_price?.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end text-xs">
                                                            {taxRate > 0 ? (
                                                                isIGST ? (
                                                                    <>
                                                                        <span>IGST {taxRate}%</span>
                                                                        <span className="text-muted-foreground">₹{item.tax_amount?.toFixed(2)}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <span>CGST {taxRate / 2}%: ₹{(item.tax_amount / 2)?.toFixed(2)}</span>
                                                                        <span>SGST {taxRate / 2}%: ₹{(item.tax_amount / 2)?.toFixed(2)}</span>
                                                                    </>
                                                                )
                                                            ) : (
                                                                <span>-</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">₹{item.subtotal?.toFixed(2)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end border-t pt-4">
                                <div className="w-1/2 md:w-1/3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Taxable Amount:</span>
                                        <span>₹{totalTaxable.toFixed(2)}</span>
                                    </div>
                                    {!isIntraState ? (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">IGST Total:</span>
                                            <span>₹{totalTax.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">CGST Total:</span>
                                                <span>₹{(totalTax / 2).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">SGST Total:</span>
                                                <span>₹{(totalTax / 2).toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between border-t pt-2 mt-2">
                                        <span className="font-bold text-gray-900">Total Amount:</span>
                                        <span className="font-bold text-lg">₹{order.total_amount?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 flex justify-end">
                                <div className="text-center">
                                    <div className="h-16 mb-2"></div>
                                    <p className="font-semibold text-gray-900 border-t border-gray-400 pt-2 px-8">Authorized Signatory</p>
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
                                {order.supplier?.gstin && <p className="text-gray-600 text-sm">GSTIN: {order.supplier.gstin}</p>}
                                {order.supplier?.state && <p className="text-gray-600 text-sm">State: {order.supplier.state}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-lg">{businessProfile?.company_name || "My Company Name"}</h3>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{businessProfile?.address || "Address Line 1"}</p>
                            {businessProfile?.gstin && <p className="text-gray-600 text-sm">GSTIN: {businessProfile.gstin}</p>}
                            {businessProfile?.state && <p className="text-gray-600 text-sm">State: {businessProfile.state}</p>}
                            <div className="mt-6">
                                <p className="text-gray-600">Date:</p>
                                <p className="font-semibold">{order.order_date ? format(new Date(order.order_date), "dd MMM yyyy") : "-"}</p>
                                {buyerState && <p className="text-gray-600 mt-1">Place of Supply: <span className="font-semibold">{businessProfile?.state}</span></p>}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[35%]">Item</TableHead>
                                    <TableHead className="w-[10%]">HSN/SAC</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Rate</TableHead>
                                    <TableHead className="text-right w-[20%]">Tax</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items?.map((item: any) => {
                                    const taxRate = calculateItemTaxRate(item.tax_amount || 0, item.subtotal || 0);

                                    // Determine tax labels based on place of supply
                                    const isIGST = !isIntraState;

                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.product?.name}</TableCell>
                                            <TableCell className="text-sm text-gray-500">{item.product?.hsn_code || "-"}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">₹{item.unit_price?.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end text-xs">
                                                    {taxRate > 0 ? (
                                                        isIGST ? (
                                                            <>
                                                                <span>IGST {taxRate}%</span>
                                                                <span className="text-muted-foreground">₹{item.tax_amount?.toFixed(2)}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>CGST {taxRate / 2}%: ₹{(item.tax_amount / 2)?.toFixed(2)}</span>
                                                                <span>SGST {taxRate / 2}%: ₹{(item.tax_amount / 2)?.toFixed(2)}</span>
                                                            </>
                                                        )
                                                    ) : (
                                                        <span>-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">₹{item.subtotal?.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                        <div className="w-1/2 md:w-1/3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Taxable Amount:</span>
                                <span>₹{totalTaxable.toFixed(2)}</span>
                            </div>
                            {!isIntraState ? (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">IGST Total:</span>
                                    <span>₹{totalTax.toFixed(2)}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">CGST Total:</span>
                                        <span>₹{(totalTax / 2).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">SGST Total:</span>
                                        <span>₹{(totalTax / 2).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-bold text-gray-900">Total Amount:</span>
                                <span className="font-bold text-lg">₹{order.total_amount?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-end">
                        <div className="text-center">
                            <div className="h-16 mb-2"></div>
                            <p className="font-semibold text-gray-900 border-t border-gray-400 pt-2 px-8">Authorized Signatory</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout >
    );
};

export default PurchaseInvoiceDetails;
