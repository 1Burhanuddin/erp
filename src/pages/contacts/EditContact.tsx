import { PageLayout } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useUpdateContact, useContact, useDeleteContact } from "@/api/contacts";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useState } from "react";

const EditContact = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: contact, isLoading, error } = useContact(id!);
    const updateContact = useUpdateContact();
    const deleteContact = useDeleteContact();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Redirect if load fails
    if (error) {
        toast.error("Failed to load contact");
        navigate("/contacts/customers");
    }

    const handleSubmit = async (data: any) => {
        try {
            await updateContact.mutateAsync({
                id: id!,
                ...data
            });

            toast.success("Contact updated successfully");

            // Navigate based on role
            if (contact?.role === 'Supplier') {
                navigate("/contacts/suppliers");
            } else {
                navigate("/contacts/customers");
            }
        } catch (error) {
            toast.error("Failed to update contact");
        }
    };

    const handleDelete = async () => {
        // Dialog confirmation handled by UI
        try {
            const role = contact?.role;
            await deleteContact.mutateAsync(id!);
            toast.success("Contact deleted");

            if (role === 'Supplier') {
                navigate("/contacts/suppliers");
            } else {
                navigate("/contacts/customers");
            }
        } catch (error) {
            toast.error("Failed to delete contact");
            setShowDeleteDialog(false);
        }
    };

    if (isLoading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-screen">
                    <CircularProgress />
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
                        onClick={() => navigate(-1)}
                        color="inherit"
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Trash2 size={16} />}
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        Delete Contact
                    </Button>
                </div>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={<Typography variant="h6" fontWeight="bold">Edit {contact?.role}</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">Editing: {contact?.name}</Typography>}
                        className="pb-2"
                    />
                    <Divider />
                    <CardContent className="pt-6">
                        <ContactForm
                            initialData={contact}
                            onSubmit={handleSubmit}
                            isSubmitting={updateContact.isPending}
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
                        This action cannot be undone. This will permanently delete the contact.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)} color="inherit">
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

export default EditContact;
