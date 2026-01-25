import { PageLayout } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useUpdateContact, useContact, useDeleteContact } from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-7">
                        <div className="space-y-1.5">
                            <CardTitle>Edit {contact?.role}</CardTitle>
                            <CardDescription>Editing: {contact?.name}</CardDescription>
                        </div>
                        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="rounded-full w-10 h-10 p-0 hover:w-48 transition-all duration-500 ease-in-out flex items-center justify-center overflow-hidden group">
                            <Trash2 className="w-4 h-4 shrink-0" />
                            <span className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-2 transition-all duration-500 whitespace-nowrap">
                                Delete Contact
                            </span>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ContactForm
                            initialData={contact}
                            onSubmit={handleSubmit}
                            isSubmitting={updateContact.isPending}
                        />
                    </CardContent>
                </Card>
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
