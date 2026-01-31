import { useState } from "react";
import { PageLayout } from "@/components/layout";
import { useCreateExpense, useExpenseCategories } from "@/api/expenses";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

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
            <div className="max-w-4xl mx-auto p-4">
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => navigate("/expenses/list")}
                    className="mb-4"
                    color="inherit"
                >
                    Back to List
                </Button>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={<Typography variant="h6" fontWeight="bold">Add Expense</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">Record a new business expense</Typography>}
                        className="pb-2"
                    />
                    <Divider />
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6} component="div">
                                    <TextField
                                        label="Date"
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        required
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} component="div">
                                    <TextField
                                        label="Amount (₹)"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        placeholder="0.00"
                                        inputProps={{ step: "0.01" }}
                                    />
                                </Grid>
                                <Grid item xs={12} component="div">
                                    <TextField
                                        label="Description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        placeholder="e.g. Office Stationary"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} component="div">
                                    <FormControl fullWidth size="small" required>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={formData.category_id}
                                            label="Category"
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        >
                                            {categories.map((cat: any) => (
                                                <MenuItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6} component="div">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Payment Method</InputLabel>
                                        <Select
                                            value={formData.payment_method}
                                            label="Payment Method"
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        >
                                            <MenuItem value="Cash">Cash</MenuItem>
                                            <MenuItem value="Card">Card</MenuItem>
                                            <MenuItem value="UPI">UPI</MenuItem>
                                            <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                            <MenuItem value="Cheque">Cheque</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() => navigate("/expenses/list")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={createExpense.isPending}
                                >
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
