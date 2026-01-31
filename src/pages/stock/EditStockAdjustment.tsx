import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { useStockAdjustment, useDeleteStockAdjustment } from "@/api/inventory";
import { format } from "date-fns";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Chip from '@mui/material/Chip';

const EditStockAdjustment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: adjustment, isLoading } = useStockAdjustment(id!);
    const deleteAdjustment = useDeleteStockAdjustment();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteAdjustment.mutateAsync(id!);
            toast.success("Adjustment deleted and stock reversed successfully");
            navigate("/stock/adjustment");
        } catch (error) {
            toast.error("Failed to delete adjustment");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!adjustment) return <div className="p-8">Adjustment not found</div>;

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <Button
                        startIcon={<ArrowLeft />}
                        onClick={() => navigate("/stock/adjustment")}
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
                        Delete Adjustment
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={<Typography variant="h6" fontWeight="bold">Adjustment {adjustment.reference_no}</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">View stock adjustment details</Typography>}
                    />
                    <Divider />
                    <CardContent className="space-y-6 pt-6">
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" color="textSecondary">Date</Typography>
                                <Typography variant="body1" fontWeight="medium">{format(new Date(adjustment.adjustment_date), "dd MMM yyyy")}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" color="textSecondary">Reason</Typography>
                                <Typography variant="body1" fontWeight="medium">{adjustment.reason}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" color="textSecondary">Notes</Typography>
                                <Typography variant="body1" fontWeight="medium">{adjustment.notes || "-"}</Typography>
                            </Grid>
                        </Grid>

                        <div className="pt-4">
                            <Typography variant="subtitle1" fontWeight="bold" className="mb-3">Adjusted Items</Typography>
                            <TableContainer className="border rounded-lg">
                                <Table size="small">
                                    <TableHead className="bg-gray-50">
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {adjustment.items?.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product?.name}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.type}
                                                        color={item.type === 'Increase' ? 'success' : 'error'}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right" className="font-bold">
                                                    {item.quantity}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                >
                    <DialogTitle>Delete Stock Adjustment?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            This will permanently delete this adjustment record and <strong>REVERSE</strong> the stock changes made by it.
                            This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDeleteDialogOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </PageLayout>
    );
};

export default EditStockAdjustment;
