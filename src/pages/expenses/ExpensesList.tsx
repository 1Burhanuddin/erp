import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
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

const ExpensesList = () => {
    const { data: expenses, isLoading, error } = useExpenses();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [mounted, setMounted] = useState(false);

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

    return (
        <PageLayout>
            {mounted && document.getElementById('header-actions') && createPortal(
                <div className="flex items-center gap-2">
                    <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                    <Button onClick={() => navigate("/expenses/add")} size="sm" className="h-9">
                        <Plus className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Add Expense</span>
                    </Button>
                </div>,
                document.getElementById('header-actions')!
            )}

            <PageHeader
                title="Expenses"
                description="Manage your business expenses"
            />

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-40 w-full rounded-xl" />
                            ))
                        ) : expenses?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No expenses found. Add one to get started.</div>
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
                    <div className="rounded-md border bg-card">
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
            </div>
        </PageLayout>
    );
};

export default ExpensesList;
