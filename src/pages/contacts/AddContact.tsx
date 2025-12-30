import { PageLayout, PageHeader } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/api/contacts";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const AddContact = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") || "Customer"; // Default to Customer if not specified
    const createContact = useCreateContact();

    const handleSubmit = async (data: any) => {
        try {
            await createContact.mutateAsync({
                ...data,
                role: role,
            });
            toast.success(`${role} created successfully`);
            // Navigate back to the correct list
            if (role === 'Supplier') {
                navigate("/contacts/suppliers");
            } else {
                navigate("/contacts/customers");
            }
        } catch (error) {
            toast.error("Failed to create contact");
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title={`Add New ${role}`}
                description={`Enter details to create a new ${role.toLowerCase()}.`}
            />
            <div className="p-6 bg-card rounded-lg border m-4">
                <ContactForm onSubmit={handleSubmit} isSubmitting={createContact.isPending} />
            </div>
        </PageLayout>
    );
};

export default AddContact;
