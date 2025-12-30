import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useSalesOrder, useAddSalePayment } from "@/api/sales";
import { format } from "date-fns";
import { Printer, CreditCard, ArrowLeft, History } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SalesInvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: sale, isLoading } = useSalesOrder(id!);
    const addPayment = useAddSalePayment();

    // Payment Form State
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleAddPayment = async () => {
        if (!sale) return;

        const balanceDue = (sale.total_amount || 0) - (sale.paid_amount || 0);

        if (paymentAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (paymentAmount > balanceDue) {
            toast.error("Payment amount cannot exceed balance due");
            return;
        }

        try {
            await addPayment.mutateAsync({
                sale_id: sale.id,
                amount: paymentAmount,
                date: paymentDate,
                method: paymentMethod,
                notes: paymentNotes
            });
            toast.success("Payment added successfully");
            setIsPaymentOpen(false);
            setPaymentAmount(0);
            setPaymentNotes("");
        } catch (error) {
            toast.error("Failed to add payment");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!sale) return <div className="p-8">Invoice not found</div>;

    const balanceDue = (sale.total_amount || 0) - (sale.paid_amount || 0);

    return (
        <PageLayout>
            <div className="print:hidden space-y-6">
                <PageHeader
                    title={`Invoice ${sale.order_no}`}
                    description="Manage invoice payments and view details"
                    actions={
                        <div className="flex gap-2">
                            {balanceDue > 0 && (
                                <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <CreditCard className="mr-2 h-4 w-4" /> Add Payment
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Payment</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="p-3 bg-muted rounded-md text-sm">
                                                <div className="flex justify-between">
                                                    <span>Total Amount:</span>
                                                    <span>₹{sale.total_amount?.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold mt-1">
                                                    <span>Balance Due:</span>
                                                    <span className="text-red-600">₹{balanceDue.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={paymentDate}
                                                        onChange={(e) => setPaymentDate(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Method</Label>
                                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Cash">Cash</SelectItem>
                                                            <SelectItem value="Card">Card</SelectItem>
                                                            <SelectItem value="UPI">UPI</SelectItem>
                                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Amount</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={balanceDue}
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Notes</Label>
                                                <Textarea
                                                    value={paymentNotes}
                                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                                    placeholder="Transaction ID, Check No, etc."
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddPayment} disabled={addPayment.isPending}>
                                                {addPayment.isPending ? "Processing..." : "Confirm Payment"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                        </div>
                    }
                />
                <Button variant="ghost" onClick={() => navigate("/sell/invoice")} className="mb-4 -mt-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview & Payments</TabsTrigger>
                        <TabsTrigger value="preview">Invoice Preview (Bill)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Amount</h3>
                                <div className="text-2xl font-bold">₹{sale.total_amount?.toFixed(2)}</div>
                            </div>
                            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Amount Paid</h3>
                                <div className="text-2xl font-bold text-green-600">₹{sale.paid_amount?.toFixed(2)}</div>
                            </div>
                            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Balance Due</h3>
                                <div className={`text-2xl font-bold ${balanceDue > 0 ? 'text-red-600' : ''}`}>
                                    ₹{balanceDue.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 pb-2">
                                <h3 className="font-semibold leading-none tracking-tight flex items-center">
                                    <History className="mr-2 h-5 w-5" /> Payment History
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Record of all payments received for this invoice.
                                </p>
                            </div>
                            <div className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.payments && sale.payments.length > 0 ? (
                                            sale.payments.map((payment: any) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{payment.payment_date ? format(new Date(payment.payment_date), "dd MMM yyyy") : "-"}</TableCell>
                                                    <TableCell>{payment.payment_method}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">{payment.notes || "-"}</TableCell>
                                                    <TableCell className="text-right font-medium">₹{payment.amount?.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                    No payments recorded yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="preview">
                        <div className="bg-white p-8 rounded-lg shadow-sm border print:shadow-none print:border-none max-w-4xl mx-auto" id="printable-invoice">
                            {/* Invoice Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                                    <p className="text-gray-500 font-mono mt-1">{sale.order_no}</p>
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-gray-900">Billed To:</h3>
                                        <p className="text-gray-700">{sale.customer?.name}</p>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{sale.customer?.address}</p>
                                        <p className="text-gray-600 text-sm">{sale.customer?.phone}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h3 className="font-semibold text-lg">My Company Setup</h3>
                                    <p className="text-gray-600 text-sm">123 Business Rd, City, Country</p>
                                    <p className="text-gray-600 text-sm">Phone: +91 1234567890</p>
                                    <div className="mt-6">
                                        <p className="text-gray-600">Date:</p>
                                        <p className="font-semibold">{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</p>
                                    </div>
                                    <div className="mt-2 text-right flex flex-col items-end gap-1">
                                        <p className="text-gray-600">Status:</p>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${sale.payment_status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                            sale.payment_status === 'Partial' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {sale.payment_status?.toUpperCase()}
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
                                        {sale.items?.map((item: any) => (
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
                                        <span className="font-bold">₹{sale.total_amount?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Amount Paid:</span>
                                        <span className="text-green-600">₹{sale.paid_amount?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 mt-2">
                                        <span className="font-bold text-lg">Balance Due:</span>
                                        <span className={`font-bold text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            ₹{balanceDue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {sale.notes && (
                                <div className="mt-8 border-t pt-4">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Notes:</h4>
                                    <p className="text-sm text-gray-600">{sale.notes}</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Print Only View covers the entire screen when printing */}
            <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8">
                {/* Re-render the invoice layout specifically for print to ensure no tab UI leaks */}
                <div className="max-w-4xl mx-auto">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                            <p className="text-gray-500 font-mono mt-1">{sale.order_no}</p>
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-900">Billed To:</h3>
                                <p className="text-gray-700">{sale.customer?.name}</p>
                                <p className="text-gray-600 text-sm whitespace-pre-wrap">{sale.customer?.address}</p>
                                <p className="text-gray-600 text-sm">{sale.customer?.phone}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-lg">My Company Setup</h3>
                            <p className="text-gray-600 text-sm">123 Business Rd, City, Country</p>
                            <p className="text-gray-600 text-sm">Phone: +91 1234567890</p>
                            <div className="mt-6">
                                <p className="text-gray-600">Date:</p>
                                <p className="font-semibold">{sale.order_date ? format(new Date(sale.order_date), "dd MMM yyyy") : "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table - Cloned for Print */}
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
                                {sale.items?.map((item: any) => (
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

                    {/* Totals - Cloned for Print */}
                    <div className="flex justify-end border-t pt-4">
                        <div className="w-1/2 md:w-1/3 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-bold">₹{sale.total_amount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="text-green-600">₹{sale.paid_amount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="font-bold text-lg">Balance Due:</span>
                                <span className={`font-bold text-lg ${balanceDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    ₹{balanceDue.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default SalesInvoiceDetails;
