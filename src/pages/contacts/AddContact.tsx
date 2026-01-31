import { PageLayout } from "@/components/layout";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useCreateContact } from "@/api/contacts";
import { toast } from "sonner";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

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
            const newContact = await createContact.mutateAsync({
                ...data,
                role: role,
            });
            toast.success(`${role} created successfully`);

            const returnUrl = searchParams.get("returnUrl");

            if (returnUrl) {
                const separator = returnUrl.includes("?") ? "&" : "?";
                navigate(`${returnUrl}${separator}newContact=${newContact.id}`);
            } else {
                // Navigate back to the correct list
                if (role === 'Supplier') {
                    navigate("/contacts/suppliers");
                } else {
                    navigate("/contacts/customers");
                }
            }
        } catch (error) {
            toast.error("Failed to create contact");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-4">
                <Button
                    startIcon={<ArrowLeft />}
                    onClick={() => navigate(-1)}
                    className="mb-4"
                    color="inherit"
                >
                    Back to List
                </Button>

                <Card className="rounded-xl shadow-sm border-0">
                    <CardHeader
                        title={<Typography variant="h6" fontWeight="bold">Add New {role}</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">Enter details to create a new {role?.toLowerCase()}.</Typography>}
                        className="pb-2"
                    />
                    <Divider />
                    <CardContent className="pt-6">
                        <ContactForm onSubmit={handleSubmit} isSubmitting={createContact.isPending} defaultRole={role!} />
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AddContact;
