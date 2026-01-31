import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { useUnits, useUpdateUnit, useDeleteUnit } from "@/api/products";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const EditUnit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: units, isLoading } = useUnits();
    const updateUnit = useUpdateUnit();
    const deleteUnit = useDeleteUnit();

    const [formData, setFormData] = useState({ name: "" });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const unit = units?.find(c => c.id === id);

    useEffect(() => {
        if (unit) {
            setFormData({
                name: unit.name
            });
        }
    }, [unit]);

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Name is required");
            return;
        }
        if (!id) return;

        try {
            await updateUnit.mutateAsync({
                id,
                ...formData,
                created_at: "",
                updated_at: ""
            });
            toast.success("Unit updated successfully");
            navigate("/products/units");
        } catch (error) {
            toast.error("Failed to update unit");
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await deleteUnit.mutateAsync(id);
            toast.success("Unit deleted");
            navigate("/products/units");
        } catch (error) {
            toast.error("Failed to delete unit");
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    if (!unit) {
        return (
            <PageLayout>
                <div className="p-8 text-center text-muted-foreground">Unit not found.</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-2xl mx-auto p-4">
                <Card>
                    <CardHeader
                        title="Edit Unit"
                        subheader={`Edit Unit: ${unit.name}`}
                        action={
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                startIcon={<Trash2 className="h-4 w-4" />}
                            >
                                Delete
                            </Button>
                        }
                    />
                    <CardContent>
                        <Stack spacing={3}>
                            <TextField
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                fullWidth
                                variant="outlined"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="outlined" color="inherit" onClick={() => navigate("/products/units")}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    disabled={updateUnit.isPending}
                                >
                                    {updateUnit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update
                                </Button>
                            </div>
                        </Stack>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
            >
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action cannot be undone. This will permanently delete the unit.
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
        </PageLayout>
    );
};

export default EditUnit;
