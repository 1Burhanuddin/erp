import { PageLayout } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/api/contacts";
import { toast } from "sonner";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AddContact = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    let role = searchParams.get("role");
    if (!role) {
        if (location.pathname.includes("/suppliers")) {
            role = "Supplier";
        } else if (location.pathname.includes("/customers")) {
            role = "Customer";
        } else {
            role = "Customer";
        }
    }
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
            <div className="max-w-4xl mx-auto p-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New {role}</CardTitle>
                        <CardDescription>Enter details to create a new {role.toLowerCase()}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ContactForm onSubmit={handleSubmit} isSubmitting={createContact.isPending} defaultRole={role!} />
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddContact;
