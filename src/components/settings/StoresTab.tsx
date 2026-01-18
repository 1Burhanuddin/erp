
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Pencil, Trash2, Loader2, Link as LinkIcon, Copy } from "lucide-react";
import { useStores, useCreateStore, useUpdateStore, useDeleteStore } from "@/api/stores";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export function StoresTab() {
    const { data: stores, isLoading } = useStores();
    const createStore = useCreateStore();
    const updateStore = useUpdateStore();
    const deleteStore = useDeleteStore();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<any>(null); // For edit dialog

    // Form states
    const [formData, setFormData] = useState({ name: "", domain: "", description: "" });

    const handleCreate = async () => {
        if (!formData.name) return;
        try {
            await createStore.mutateAsync(formData);
            toast.success("Store created successfully");
            setIsCreateOpen(false);
            setFormData({ name: "", domain: "", description: "" });
        } catch (error) {
            toast.error("Failed to create store");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteStore.mutateAsync(id);
                toast.success("Store deleted");
            } catch (error) {
                toast.error("Failed to delete store");
            }
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateStore.mutateAsync({ id, is_active: !currentStatus });
            toast.success(`Store ${!currentStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Store ID copied to clipboard");
    }

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Store Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your connected e-commerce stores and channels.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add New Store
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Store</DialogTitle>
                            <DialogDescription>Create a new channel to sell your products.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Store Name</Label>
                                <Input
                                    placeholder="e.g. My AC Store"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Domain / URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        placeholder="https://example.com"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Internal description for this store..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={createStore.isPending}>
                                {createStore.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Store
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store Name</TableHead>
                                <TableHead>Store ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stores?.map((store: any) => (
                                <TableRow key={store.id}>
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            {store.name}
                                        </div>
                                        {store.domain && <div className="text-xs text-muted-foreground ml-6">{store.domain}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{store.id.slice(0, 8)}...</code>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyId(store.id)} title="Copy Full ID">
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={store.is_active}
                                                onCheckedChange={() => handleToggleActive(store.id, store.is_active)}
                                            />
                                            <Badge variant={store.is_active ? "default" : "secondary"}>
                                                {store.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    {/* Format date properly */}
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(store.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(store.id, store.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {stores?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No stores configured yet. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {stores?.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                    <h4 className="font-medium flex items-center gap-2 text-blue-800 dark:text-blue-300">
                        <LinkIcon className="h-4 w-4" /> Integration Guide
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        To connect a website to a specific store, use the <strong>Store ID</strong> in your API calls.
                        Example: <code>supabase.rpc('get_store_products', {'{'} store_id: 'YOUR_STORE_ID' {'}'})</code>
                    </p>
                </div>
            )}
        </div>
    );
}
