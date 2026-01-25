import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Loader2, ArrowLeft, Store } from "lucide-react";
import { useState } from "react";
import { useCreateStore } from "@/api/stores";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function AddStore() {
    const navigate = useNavigate();
    const createStore = useCreateStore();

    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        description: ""
    });

    const handleCreate = async () => {
        if (!formData.name) {
            toast.error("Store name is required");
            return;
        }

        try {
            await createStore.mutateAsync(formData);
            toast.success("Store created successfully");
            navigate("/settings/stores");
        } catch (error) {
            toast.error("Failed to create store");
        }
    };

    return (
        <PageLayout>
            <div className="space-y-6 max-w-4xl mx-auto mt-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Store</h1>
                    <p className="text-muted-foreground">Create a new channel to sell your products and manage inventory.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Store Details</CardTitle>
                        <CardDescription>Enter the basic information for your new store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Store Name <span className="text-destructive">*</span></Label>
                                <div className="relative">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        className="pl-10"
                                        placeholder="e.g. My AC Store"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="domain">Domain / URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="domain"
                                        className="pl-10"
                                        placeholder="https://example.com"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    The website URL where this store will be hosted.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Internal description for this store..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" className="mr-2" onClick={() => navigate("/settings/stores")}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createStore.isPending}>
                                {createStore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Store
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
