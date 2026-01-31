import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowLeft, Trash2 } from "lucide-react";

export default function EditEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        const fetchEmployee = async () => {
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                toast.error("Could not load employee");
                navigate("/employees/list");
                return;
            }
            if (data) {
                setInitialData(data);
            }
            setFetching(false);
        };
        fetchEmployee();
    }, [id, navigate]);

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from("employees")
                .update(formData)
                .eq("id", id);

            if (error) throw error;

            toast.success("Updated successfully");
            navigate("/employees/list");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.from("employees").delete().eq("id", id);
            if (error) throw error;
            toast.success("Employee deleted");
            navigate("/employees/list");
        } catch (error: any) {
            toast.error(error.message);
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    if (fetching) {
        return (
            <PageLayout>
                <div className="flex justify-center items-center h-64">
                    <CircularProgress />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-4">
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => navigate("/employees/list")}
                    className="mb-4"
                    color="inherit"
                >
                    Back to List
                </Button>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={
                            <div className="flex justify-between items-center">
                                <Typography variant="h6" fontWeight="bold">Edit Employee</Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Trash2 size={16} />}
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    Delete
                                </Button>
                            </div>
                        }
                        subheader={<Typography variant="body2" color="textSecondary">Managing {initialData?.full_name}</Typography>}
                        className="pb-2"
                    />
                    <Divider />
                    <CardContent className="pt-6">
                        <EmployeeForm
                            initialData={initialData}
                            onSubmit={handleSubmit}
                            isSubmitting={loading}
                            isEditing={true}
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
            >
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action cannot be undone. This will permanently delete the employee.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
}
