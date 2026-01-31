import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useCreateStockAdjustment } from "@/api/inventory";
import { useProducts } from "@/api/products";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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

const AddStockAdjustment = () => {
    const navigate = useNavigate();
    const { data: products } = useProducts();
    const createAdjustment = useCreateStockAdjustment();

    // Form State
    const [referenceNo, setReferenceNo] = useState(`ADJ-${Date.now()}`);
    const [adjustmentDate, setAdjustmentDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [reason, setReason] = useState("Stock Take");
    const [notes, setNotes] = useState("");

    // Item State
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [type, setType] = useState<"Increase" | "Decrease">("Increase");

    const handleCreate = async () => {
        if (!selectedProduct || quantity <= 0) {
            toast.error("Please select a product and valid quantity");
            return;
        }

        try {
            await createAdjustment.mutateAsync({
                adjustment: {
                    reference_no: referenceNo,
                    adjustment_date: adjustmentDate,
                    reason,
                    notes,
                },
                items: [
                    {
                        product_id: selectedProduct,
                        quantity: quantity,
                        type: type,
                    },
                ],
            });
            toast.success("Stock adjustment created successfully");
            navigate("/stock/adjustment");
        } catch (error) {
            toast.error("Failed to create adjustment");
            console.error(error);
        }
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-4">
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => navigate("/stock/adjustment")}
                    className="mb-4"
                    color="inherit"
                >
                    Back to List
                </Button>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={<Typography variant="h6" fontWeight="bold">New Stock Adjustment</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">Create a new stock adjustment record</Typography>}
                        className="pb-2"
                    />
                    <Divider />
                    <CardContent className="space-y-6 pt-6">
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6} component="div">
                                <TextField
                                    label="Reference No"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={6} component="div">
                                <TextField
                                    label="Date"
                                    type="date"
                                    value={adjustmentDate}
                                    onChange={(e) => setAdjustmentDate(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} component="div">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Reason</InputLabel>
                                    <Select
                                        value={reason}
                                        label="Reason"
                                        onChange={(e) => setReason(e.target.value)}
                                    >
                                        <MenuItem value="Stock Take">Stock Take</MenuItem>
                                        <MenuItem value="Damaged">Damaged</MenuItem>
                                        <MenuItem value="Theft">Theft</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                            <Typography variant="subtitle2" fontWeight="bold" className="mb-2">Adjustment Item</Typography>
                            <Grid container spacing={3} component="div">
                                <Grid item xs={12} component="div">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Product</InputLabel>
                                        <Select
                                            value={selectedProduct}
                                            label="Product"
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                        >
                                            <MenuItem value="">
                                                <em>Select Product</em>
                                            </MenuItem>
                                            {products?.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.name} (Cur: {p.current_stock})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6} component="div">
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={type}
                                            label="Type"
                                            onChange={(e) => setType(e.target.value as "Increase" | "Decrease")}
                                        >
                                            <MenuItem value="Increase">Increase (+)</MenuItem>
                                            <MenuItem value="Decrease">Decrease (-)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6} component="div">
                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                            </Grid>
                        </div>

                        <TextField
                            label="Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder="Optional notes..."
                        />

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={() => navigate("/stock/adjustment")}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreate}
                                disabled={createAdjustment.isPending}
                            >
                                {createAdjustment.isPending ? "Creating..." : "Save Adjustment"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddStockAdjustment;
