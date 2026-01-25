
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Trash2, Loader2, Link as LinkIcon, Copy, Pencil } from "lucide-react";
import { useStores, useUpdateStore, useDeleteStore } from "@/api/stores";
import { toast } from "sonner";

export function StoresTab() {
    const navigate = useNavigate();
    const { data: stores, isLoading } = useStores();
    // const createStore = useCreateStore(); // Moved to AddStore page
    const updateStore = useUpdateStore();
    const deleteStore = useDeleteStore();

    // const [isCreateOpen, setIsCreateOpen] = useState(false); // Removed
    // const [formData, setFormData] = useState({ name: "", domain: "", description: "" }); // Removed

    /* createStore logic moved to AddStore page */

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
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Store Name</TableHead>
                                <TableHead>Store ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stores?.map((store: any) => (
                                <TableRow
                                    key={store.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => navigate(`/settings/stores/edit/${store.id}`)}
                                >
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            {store.name}
                                        </div>
                                        {store.domain && <div className="text-xs text-muted-foreground ml-6">{store.domain}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{store.id.slice(0, 8)}...</code>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyId(store.id)} title="Copy Full ID">
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Switch
                                                checked={store.is_active}
                                                onCheckedChange={() => handleToggleActive(store.id, store.is_active)}
                                            />
                                            <Badge variant={store.is_active ? "default" : "secondary"}>
                                                {store.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(store.created_at).toLocaleDateString()}
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
