import { PageLayout, PageHeader } from "@/components/layout";
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

    if (error) {
        return (
            <PageLayout>
                <div className="p-4 text-red-500">Error loading expenses: {(error as Error).message}</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title="Expenses"
                description="Manage your business expenses"
                actions={
                    <Button onClick={() => navigate("/expenses/add")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                    </Button>
                }
            />

            <div className="p-4">
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
            </div>
        </PageLayout>
    );
};

export default ExpensesList;
