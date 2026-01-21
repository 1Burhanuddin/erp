import { PageLayout, PageHeader } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useUpdateContact, useContact, useDeleteContact } from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
                <div className="p-8 space-y-4">
                    <Skeleton className="h-12 w-48" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageHeader
                title={`Edit ${contact?.role}`}
                description={`Editing: ${contact?.name}`}
                actions={
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Contact
                    </Button>
                }
            />
            <div className="p-6 bg-card rounded-lg border m-4">
                <ContactForm
                    initialData={contact}
                    onSubmit={handleSubmit}
                    isSubmitting={updateContact.isPending}
                />
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the contact.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    );
};

export default EditContact;
