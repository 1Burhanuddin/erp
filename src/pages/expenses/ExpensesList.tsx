import { PageLayout, PageHeader } from "@/components/layout";
import { useExpenses, useCreateExpense } from "@/api/expenses";
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
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const ExpensesList = () => {
    const { data: expenses, isLoading, error } = useExpenses();
    const createExpense = useCreateExpense();

    const handleCreateTestExpense = async () => {
        try {
            await createExpense.mutateAsync({
                amount: Math.floor(Math.random() * 1000) + 100,
                description: "Test Expense " + new Date().toLocaleTimeString(),
                payment_method: "Cash",
                expense_date: new Date().toISOString().split("T")[0],
            });
            toast.success("Test expense created successfully");
        } catch (err) {
            toast.error("Failed to create expense");
            console.error(err);
        }
    };

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
                    <Button onClick={handleCreateTestExpense}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Test Expense
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
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            {expense.expense_date
                                                ? format(new Date(expense.expense_date), "MMM d, yyyy")
                                                : "-"}
                                        </TableCell>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>{expense.category?.name || "-"}</TableCell>
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
