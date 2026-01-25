import { useState, useEffect } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useExpense, useUpdateExpense, useDeleteExpense, useExpenseCategories } from "@/api/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EditExpense = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: expense, isLoading } = useExpense(id || "");
    const updateExpense = useUpdateExpense();
    const deleteExpense = useDeleteExpense();
    const { data: categories = [] } = useExpenseCategories();

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category_id: "",
        payment_method: "Cash",
        expense_date: "",
    });

    useEffect(() => {
        if (expense) {
            setFormData({
                description: expense.description || "",
                amount: expense.amount.toString(),
                category_id: expense.category_id || "",
                payment_method: expense.payment_method || "Cash",
                expense_date: expense.expense_date,
            });
        }
    }, [expense]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!formData.description || !formData.amount || !formData.category_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        updateExpense.mutate({
            id: id,
            description: formData.description,
            amount: parseFloat(formData.amount),
            category_id: formData.category_id,
            payment_method: formData.payment_method,
            expense_date: formData.expense_date,
        }, {
            onSuccess: () => {
                toast.success("Expense updated successfully");
                navigate("/expenses/list");
            },
            onError: (error) => {
                toast.error("Failed to update expense: " + error.message);
            }
        });
    };

    const handleDelete = () => {
        if (!id) return;
        deleteExpense.mutate(id, {
            onSuccess: () => {
                toast.success("Expense deleted successfully");
                navigate("/expenses/list");
            },
            onError: (error) => {
                toast.error("Failed to delete expense: " + error.message);
            }
        });
    };

    if (isLoading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-7">
                        <div className="space-y-1.5">
                            <CardTitle>Edit Expense</CardTitle>
                            <CardDescription>Update expense details</CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="rounded-full w-10 h-10 p-0 hover:w-48 transition-all duration-500 ease-in-out flex items-center justify-center overflow-hidden group">
                                    <Trash2 className="w-4 h-4 shrink-0" />
                                    <span className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-2 transition-all duration-500 whitespace-nowrap">
                                        Delete Expense
                                    </span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the expense record.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        {deleteExpense.isPending ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (₹) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g. Office Stationary"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate("/expenses/list")}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateExpense.isPending}>
                                    {updateExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Expense
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default EditExpense;
