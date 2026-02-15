import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { useCreateExpense, useExpenseCategories } from "@/api/expenses";
import { Button } from "@/components/ui/button";

import { FloatingLabelInput } from "@/components/ui/floating-label-input";
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
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AddExpense = () => {
    const navigate = useNavigate();
    const createExpense = useCreateExpense();
    const { data: categories = [] } = useExpenseCategories();

    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category_id: "",
        payment_method: "Cash",
        expense_date: new Date().toISOString().split("T")[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.description || !formData.amount || !formData.category_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        createExpense.mutate({
            description: formData.description,
            amount: parseFloat(formData.amount),
            category_id: formData.category_id,
            payment_method: formData.payment_method,
            expense_date: formData.expense_date,
        }, {
            onSuccess: () => {
                toast.success("Expense added successfully");
                navigate("/expenses/list");
            },
            onError: (error) => {
                toast.error("Failed to add expense: " + error.message);
            }
        });
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Expense</CardTitle>
                        <CardDescription>Record a new business expense</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="date"
                                        label="Date *"
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <FloatingLabelInput
                                        id="amount"
                                        label="Amount (₹) *"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <FloatingLabelInput
                                    id="description"
                                    label="Description *"
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
                                <Button type="submit" disabled={createExpense.isPending}>
                                    {createExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Expense
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddExpense;
