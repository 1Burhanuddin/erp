import { PageLayout, PageHeader } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useUpdateContact, useContact, useDeleteContact } from "@/api/contacts";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const EditContact = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: contact, isLoading, error } = useContact(id!);
    const updateContact = useUpdateContact();
    const deleteContact = useDeleteContact();

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
        if (confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
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
            }
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
                    <Button variant="destructive" onClick={handleDelete}>
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
        </PageLayout>
    );
};

export default EditContact;
