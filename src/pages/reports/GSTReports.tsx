import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGSTReports } from "@/api/reports";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, FileText, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CSVLink } from "react-csv";

const GSTReports = () => {
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
    });

    const { data: report, isLoading } = useGSTReports({
        startDate: dateRange.from,
        endDate: dateRange.to
    });

    if (isLoading) {
        return <PageLayout><div className="p-8">Loading GST Data...</div></PageLayout>;
    }

    const gstr1 = report?.gstr1;
    const gstr3b = report?.gstr3b;

    // CSV Headers
    const b2bHeaders = [
        { label: "Invoice No", key: "invoiceNo" },
        { label: "Date", key: "date" },
        { label: "Value", key: "value" },
        { label: "Rate", key: "rate" },
        { label: "IGST", key: "igst" },
        { label: "CGST", key: "cgst" },
        { label: "SGST", key: "sgst" },
        { label: "State", key: "state" }
    ];

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <PageHeader
                    title="GST Compliance Reports"
                    description="GSTR-1 (Sales) and GSTR-3B (Summary) ready for filing."
                    className="mb-0"
                />

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[260px] justify-start text-left font-normal rounded-full">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Select Date Range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={(range: any) => setDateRange(range)}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Tabs defaultValue="gstr1" className="space-y-6">
                <TabsList className="bg-white border rounded-full p-1 h-12 shadow-sm">
                    <TabsTrigger value="gstr1" className="rounded-full px-6 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white">GSTR-1 (Sales)</TabsTrigger>
                    <TabsTrigger value="gstr3b" className="rounded-full px-6 h-10 data-[state=active]:bg-stone-900 data-[state=active]:text-white">GSTR-3B (Summary)</TabsTrigger>
                </TabsList>

                <TabsContent value="gstr1" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="rounded-3xl border-0 shadow-sm p-6 bg-blue-50/50">
                            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">Total B2B Sales</h3>
                            <p className="text-3xl font-bold text-blue-700">₹{(gstr1?.b2b?.reduce((s: any, i: any) => s + i.value, 0) || 0).toLocaleString()}</p>
                            <p className="text-sm text-blue-600/80 mt-1">{gstr1?.b2b?.length || 0} Invoices</p>
                        </Card>
                        <Card className="rounded-3xl border-0 shadow-sm p-6 bg-emerald-50/50">
                            <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider mb-2">Total B2C Sales</h3>
                            <p className="text-3xl font-bold text-emerald-700">₹{(gstr1?.b2c?.reduce((s: any, i: any) => s + i.value, 0) || 0).toLocaleString()}</p>
                            <p className="text-sm text-emerald-600/80 mt-1">{gstr1?.b2c?.length || 0} Invoices</p>
                        </Card>
                        <Card className="rounded-3xl border-0 shadow-sm p-6 bg-purple-50/50">
                            <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wider mb-2">Total Tax Liability</h3>
                            <p className="text-3xl font-bold text-purple-700">
                                ₹{((
                                    (gstr1?.b2b?.reduce((s: any, i: any) => s + i.igst + i.cgst + i.sgst, 0) || 0) +
                                    (gstr1?.b2c?.reduce((s: any, i: any) => s + i.igst + i.cgst + i.sgst, 0) || 0)
                                ).toLocaleString())}
                            </p>
                            <p className="text-sm text-purple-600/80 mt-1">IGST + CGST + SGST</p>
                        </Card>
                    </div>

                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-stone-50/50 border-b border-stone-100 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg">B2C Invoices (Small & Large)</CardTitle>
                            <Button variant="outline" size="sm" className="gap-2 rounded-full">
                                <Download className="h-4 w-4" />
                                <CSVLink data={gstr1?.b2c || []} headers={b2bHeaders} filename={`GSTR1_B2C_${format(new Date(), 'yyyyMMdd')}.csv`}>
                                    Export CSV
                                </CSVLink>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Invoice No</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>State</TableHead>
                                        <TableHead className="text-right">Value</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">IGST</TableHead>
                                        <TableHead className="text-right">CGST</TableHead>
                                        <TableHead className="text-right">SGST</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gstr1?.b2c?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                                No B2C transactions found in this period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        gstr1?.b2c?.map((item: any, idx: number) => (
                                            <TableRow key={idx} className="hover:bg-stone-50">
                                                <TableCell className="font-medium">{item.invoiceNo}</TableCell>
                                                <TableCell>{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                                                <TableCell>{item.state}</TableCell>
                                                <TableCell className="text-right text-stone-600">₹{item.value.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-red-600 font-medium">{item.rate}%</TableCell>
                                                <TableCell className="text-right">₹{item.igst.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">₹{item.cgst.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">₹{item.sgst.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="bg-stone-50/50 border-b border-stone-100 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg">HSN-wise Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>HSN Code</TableHead>
                                        <TableHead className="text-right">Total Quantity</TableHead>
                                        <TableHead className="text-right">Taxable Value</TableHead>
                                        <TableHead className="text-right">Total Tax</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gstr1?.hsn?.map((hsn: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-mono font-bold">{hsn.hsn}</TableCell>
                                            <TableCell className="text-right">{hsn.quantity}</TableCell>
                                            <TableCell className="text-right">₹{hsn.value.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-red-600">₹{hsn.tax.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gstr3b">
                    <Card className="border-0 shadow-sm rounded-3xl p-8 max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">GSTR-3B Summary</h2>
                            <p className="text-muted-foreground">Monthly Self-Declaration</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">3.1 Details of Outward Supplies (Sales)</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-4 bg-stone-50 rounded-xl">
                                        <p className="text-stone-500 mb-1">Total Taxable Value</p>
                                        <p className="text-2xl font-bold text-stone-900">₹{(gstr3b?.outward?.taxable || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-stone-50 rounded-xl">
                                        <p className="text-stone-500 mb-1">Total Tax Liability</p>
                                        <p className="text-2xl font-bold text-red-600">₹{(gstr3b?.outward?.tax || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">4. Eligible ITC (Input Tax Credit)</h3>
                                <div className="p-6 bg-stone-100/50 rounded-xl text-center">
                                    <p className="text-stone-500 mb-1">ITC Available (From Purchases)</p>
                                    <p className="text-3xl font-bold text-stone-400">Coming Soon</p>
                                    <p className="text-xs text-stone-400 mt-2">Will be enabled with Purchase Module update</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
};

export default GSTReports;
