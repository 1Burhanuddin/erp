import { PageLayout } from "@/components/layout";
import { useCreateEmployee } from "@/api/employees";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const AddEmployee = () => {
    const navigate = useNavigate();
    const createEmployee = useCreateEmployee();

    const handleSubmit = async (data: any) => {
        try {
            await createEmployee.mutateAsync(data);
            navigate("/employees/list");
        } catch (error) {
            console.error("Failed", error);
        }
    };

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
                        title={<Typography variant="h6" fontWeight="bold">Add New Employee</Typography>}
                        subheader={<Typography variant="body2" color="textSecondary">Create a new staff profile</Typography>}
                        className="pb-2"
                    />
                    <Divider />
                    <CardContent className="pt-6">
                        <EmployeeForm onSubmit={handleSubmit} isSubmitting={createEmployee.isPending} />
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}

export default AddEmployee;
