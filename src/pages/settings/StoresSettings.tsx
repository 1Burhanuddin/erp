import { PageLayout, PageHeader } from "@/components/layout";
import { StoresTab } from "@/components/settings/StoresTab";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StoresSettings() {
    const navigate = useNavigate();
    return (
        <PageLayout>
            <PageHeader
                title="Stores"
                description="Manage your store locations and branches."
                actions={
                    <Button onClick={() => navigate("/settings/stores/add")}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Store
                    </Button>
                }
            />
            <div className="max-w-4xl">
                <StoresTab />
            </div>
        </PageLayout>
    );
}
