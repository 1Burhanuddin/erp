import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useExpenses } from "@/api/expenses";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
// MUI Imports
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';

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
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-full max-w-sm">
                        <ExpandableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search expenses..."
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} variant="floating" />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => navigate("/expenses/add")}
                            className="h-9 px-4 ml-2"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} variant="rectangular" height={160} className="w-full rounded-xl" />
                            ))
                        ) : expenses.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                {searchQuery ? `No expenses found matching "${searchQuery}"` : "No expenses found. Add one to get started."}
                            </div>
                        ) : (
                            expenses.map((expense: any) => (
                                <DataCard key={expense.id} onClick={() => navigate(`/expenses/edit/${expense.id}`)} className="cursor-pointer transition-colors hover:border-primary/50">
                                    <div className="flex flex-col gap-1 items-start mb-2">
                                        <div className="w-full flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{expense.description}</h3>
                                                <span className="text-xs text-muted-foreground">{expense.category?.name || "Uncategorized"}</span>
                                            </div>
                                            <div className="font-medium text-lg">
                                                ₹{expense.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {expense.notes && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{expense.notes}</p>
                                    )}

                                    <div className="mt-4 pt-3 border-t text-sm flex justify-between items-center text-muted-foreground">
                                        <span>{expense.expense_date ? format(new Date(expense.expense_date), "MMM d, yyyy") : "-"}</span>
                                        <Chip label={expense.payment_method} size="small" variant="outlined" className="h-6 text-xs" />
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <Card className="rounded-3xl border-0 shadow-sm overflow-hidden">
                        <TableContainer>
                            <Table>
                                <TableHead className="bg-gray-50">
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Payment Method</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={200} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={60} className="ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : expenses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No expenses found. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        expenses.map((expense: any) => (
                                            <TableRow
                                                key={expense.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                                                hover
                                            >
                                                <TableCell>
                                                    {expense.expense_date
                                                        ? format(new Date(expense.expense_date), "MMM d, yyyy")
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{expense.description}</span>
                                                        {expense.notes && (
                                                            <span className="text-xs text-muted-foreground line-clamp-1">{expense.notes}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={expense.category?.name || "Uncategorized"}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        className="h-6 text-xs"
                                                    />
                                                </TableCell>
                                                <TableCell>{expense.payment_method}</TableCell>
                                                <TableCell align="right" className="font-medium">
                                                    ₹{expense.amount.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                )}
            </div>
        </PageLayout >
    );
};

export default ExpensesList;
