import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, AlertCircle, Package, BarChart3, FileText, PieChart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CSVLink } from "react-csv";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StockReport = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStockData();
    }, []);

    const fetchStockData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("products")
                .select(`
                    id, 
                    name, 
                    sku, 
                    current_stock, 
                    purchase_price, 
                    selling_price,
                    product_categories(name)
                `)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error("Error fetching stock:", err);
            setError(err.message || "Failed to load stock data");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockValue = products.reduce((sum, p) => sum + ((p.current_stock || 0) * (p.purchase_price || 0)), 0);
    const totalItems = products.length;
    const lowStockItems = 0; // Temporarily disabled as min_stock_level doesn't exist

    const csvHeaders = [
        { label: "SKU", key: "sku" },
        { label: "Product Name", key: "name" },
        { label: "Category", key: "product_categories.name" },
        { label: "Current Stock", key: "current_stock" },
        { label: "Purchase Price", key: "purchase_price" },
        { label: "Stock Value", key: "stockValue" }
    ];

    const csvData = filteredProducts.map(p => ({
        ...p,
        stockValue: ((p.current_stock || 0) * (p.purchase_price || 0)).toFixed(2)
    }));

    const ReportTabs = () => (
        <div className="bg-white dark:bg-card border-none sm:border sm:border-border/50 sm:shadow-sm sm:rounded-2xl overflow-hidden mb-6">
            <Tabs value={location.pathname} onValueChange={(v) => navigate(v)} className="w-full">
                <div className="flex border-b pt-3 px-4 sm:px-6 gap-1 bg-slate-50/50 dark:bg-muted/10 overflow-x-auto no-scrollbar relative min-h-[50px]">
                    <TabsList className="bg-transparent h-auto p-0 border-none flex gap-1 justify-start absolute bottom-0">
                        <TabsTrigger
                            value="/reports/profit-loss"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:border-b-transparent border border-transparent data-[state=active]:border-border rounded-t-xl rounded-b-none px-5 py-2.5 text-sm font-semibold data-[state=active]:text-primary text-muted-foreground transition-none data-[state=active]:shadow-none relative top-[1px]"
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Profit & Loss
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="/reports/gst"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:border-b-transparent border border-transparent data-[state=active]:border-border rounded-t-xl rounded-b-none px-5 py-2.5 text-sm font-semibold data-[state=active]:text-primary text-muted-foreground transition-none data-[state=active]:shadow-none relative top-[1px]"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                GST Reports
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="/reports/stock"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:border-b-transparent border border-transparent data-[state=active]:border-border rounded-t-xl rounded-b-none px-5 py-2.5 text-sm font-semibold data-[state=active]:text-primary text-muted-foreground transition-none data-[state=active]:shadow-none relative top-[1px]"
                        >
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Stock Valuation
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="/reports/expenses"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:border-b-transparent border border-transparent data-[state=active]:border-border rounded-t-xl rounded-b-none px-5 py-2.5 text-sm font-semibold data-[state=active]:text-primary text-muted-foreground transition-none data-[state=active]:shadow-none relative top-[1px]"
                        >
                            <div className="flex items-center gap-2">
                                <PieChart className="h-4 w-4" />
                                Expense Breakdown
                            </div>
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>
        </div>
    );

    if (isLoading) {
        return (
            <PageLayout>
                <ReportTabs />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
                <Skeleton className="h-[400px] rounded-3xl" />
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <ReportTabs />
                <div className="p-6 rounded-3xl bg-destructive/10 text-destructive text-center">
                    <h3 className="font-semibold mb-2">Error loading report</h3>
                    <p>{error}</p>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <ReportTabs />

            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-6">
                <Button asChild className="rounded-full shadow-sm">
                    <CSVLink data={csvData} headers={csvHeaders} filename="Stock_Valuation_Report.csv">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </CSVLink>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">Total Total Stock Value</p>
                                <h3 className="text-4xl font-bold text-blue-700">₹{totalStockValue.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-sm">
                                <Package className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm overflow-hidden bg-stone-50">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Unique Products</p>
                                <h3 className="text-4xl font-bold text-stone-900">{totalItems}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "rounded-3xl border-0 shadow-sm overflow-hidden",
                    lowStockItems > 0 ? "bg-red-50" : "bg-emerald-50"
                )}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className={cn(
                                    "text-sm font-semibold uppercase tracking-wider mb-2",
                                    lowStockItems > 0 ? "text-red-900" : "text-emerald-900"
                                )}>Low Stock Alerts</p>
                                <h3 className={cn(
                                    "text-4xl font-bold",
                                    lowStockItems > 0 ? "text-red-700" : "text-emerald-700"
                                )}>{lowStockItems} Items</h3>
                            </div>
                            {lowStockItems > 0 && (
                                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-sm animate-pulse">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by SKU or Name..."
                            className="pl-9 rounded-full bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6">SKU</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">In Stock</TableHead>
                                <TableHead className="text-right">Purchase Price</TableHead>
                                <TableHead className="text-right pr-6">Stock Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                        No products found in inventory.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((p) => {
                                    const value = (p.current_stock || 0) * (p.purchase_price || 0);

                                    return (
                                        <TableRow key={p.id} className="hover:bg-stone-50 transition-colors">
                                            <TableCell className="font-mono text-xs pl-6">{p.sku || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {p.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-stone-500">{p.product_categories?.name || 'Uncategorized'}</TableCell>
                                            <TableCell className="text-right font-medium text-stone-900">
                                                {p.current_stock || 0}
                                            </TableCell>
                                            <TableCell className="text-right text-stone-500">₹{p.purchase_price?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell className="text-right font-bold pr-6">₹{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </PageLayout>
    );
};

export default StockReport;
