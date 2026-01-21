import { PageLayout, PageHeader } from "@/components/layout";
import { StoresTab } from "@/components/settings/StoresTab";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StoresSettings() {
    const navigate = useNavigate();
    return (
        <PageLayout>
            <div className="flex items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Stores</h1>
                    <p className="text-muted-foreground">Manage your store locations and branches.</p>
                </div>
            </div>
            <div className="max-w-4xl">
                <StoresTab />
            </div>
        </PageLayout>
    );
}
