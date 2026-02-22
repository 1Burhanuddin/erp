import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataCard } from "@/components/shared";
import { ListingLayout } from "@/components/layout/ListingLayout";
import { useExpenses } from "@/api/expenses";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

import { Upload, Download, CreditCard } from "lucide-react";
import { downloadCSV } from "@/lib/csvParser";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ExpensesList = () => {
    const { data: rawExpenses, isLoading, error } = useExpenses();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    const expenses = rawExpenses?.filter((e: any) =>
        !searchQuery.trim() ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleExportCSV = () => {
        if (!expenses || expenses.length === 0) {
            toast.error("No expenses to export");
            return;
        }

        downloadCSV(
            expenses,
            ["Date", "Description", "Category", "Payment Method", "Amount"],
            (e: any) => [
                e.expense_date ? format(new Date(e.expense_date), "yyyy-MM-dd") : "",
                e.description || "",
                e.category?.name || "",
                e.payment_method || "",
                e.amount?.toString() || "0"
            ],
            "expenses_export.csv"
        );
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (error) {
        return (
            <PageLayout>
                <div className="p-4 text-red-500">Error loading expenses: {(error as Error).message}</div>
            </PageLayout>
        );
    }

    const headerActions = (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-2 sm:px-4">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                        Export as CSV
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="h-10 px-2 sm:px-4" onClick={() => navigate("/expenses/import")}>
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Import</span>
            </Button>
        </>
    );

    return (
        <PageLayout>
            <ListingLayout
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search expenses..."
                onAdd={() => navigate("/expenses/add")}
                addLabel="Add Expense"
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                headerActions={headerActions}
                tabs={[
                    { id: 'all', label: 'All Expenses', icon: CreditCard, count: expenses.length }
                ]}
                activeTab="all"
            >
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))
                        ) : expenses?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No expenses found matching "${searchQuery}"` : "No expenses found. Add one to get started."}
                            </div>
                        ) : (
                            expenses?.map((expense: any) => (
                                <DataCard key={expense.id} onClick={() => navigate(`/expenses/edit/${expense.id}`)} className="cursor-pointer transition-colors">
                                    <div className="flex flex-col gap-1 items-start mb-2">
                                        <div className="w-full">
                                            <h3 className="font-semibold text-foreground">{expense.description}</h3>
                                            <span className="text-xs text-muted-foreground">{expense.category?.name || "Uncategorized"}</span>
                                        </div>
                                        <div className="font-medium text-lg mt-1">
                                            ₹{expense.amount.toFixed(2)}
                                        </div>
                                    </div>

                                    {expense.notes && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{expense.notes}</p>
                                    )}

                                    <div className="mt-4 pt-3 border-t text-sm flex justify-between items-center text-muted-foreground">
                                        <span>{expense.expense_date ? format(new Date(expense.expense_date), "MMM d, yyyy") : "-"}</span>
                                        <span>{expense.payment_method}</span>
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border-0 shadow-sm bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : expenses?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No expenses found. Add one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    expenses?.map((expense: any) => (
                                        <TableRow
                                            key={expense.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                                        >
                                            <TableCell>
                                                {expense.expense_date
                                                    ? format(new Date(expense.expense_date), "MMM d, yyyy")
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{expense.description}</span>
                                                    {expense.notes && (
                                                        <span className="text-xs text-muted-foreground">{expense.notes}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    {expense.category?.name || "Uncategorized"}
                                                </span>
                                            </TableCell>
                                            <TableCell>{expense.payment_method}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ₹{expense.amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </ListingLayout>
        </PageLayout>
    );
};

export default ExpensesList;
