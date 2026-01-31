import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { useExpense, useUpdateExpense, useDeleteExpense, useExpenseCategories } from "@/api/expenses";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const EditExpense = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: expense, isLoading } = useExpense(id || "");
    const updateExpense = useUpdateExpense();
    const deleteExpense = useDeleteExpense();
    const { data: categories = [] } = useExpenseCategories();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Button
                        startIcon={<ArrowLeft />}
                        onClick={() => navigate("/expenses/list")}
                        color="inherit"
                    >
                        Back to List
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Trash2 size={16} />}
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        Delete Expense
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={<Typography variant="h6" fontWeight="bold">Edit Expense</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">Update expense details</Typography>}
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
                                    disabled={updateExpense.isPending}
                                >
                                    {updateExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Expense
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                >
                    <DialogTitle>Delete Expense?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            This action cannot be undone. This will permanently delete the expense record.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDeleteDialogOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
                            {deleteExpense.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </PageLayout>
    );
};

export default EditExpense;
