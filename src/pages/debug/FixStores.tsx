import { useEffect, useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export default function FixStores() {
    const [stores, setStores] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [currentStore, setCurrentStore] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get Me
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: emp } = await supabase.from('employees').select('*, stores(*)').eq('id', user.id).single();
            setCurrentUser(emp);
            setCurrentStore(emp?.stores);

            // 2. Get Stores
            const { data: allStores } = await supabase.from('stores').select('*');
            setStores(allStores || []);

            // 3. Get All Employees (to see the mess)
            // Since we are admin, we see everyone in our CURRENT store (which is the shared one)
            const { data: allEmps } = await supabase.from('employees').select('full_name, id, store_id, role');
            setEmployees(allEmps || []);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSelf = async (storeId: string) => {
        if (!currentUser) return;
        setProcessing(true);
        try {
            const { error } = await supabase
                .from('employees')
                .update({ store_id: storeId })
                .eq('id', currentUser.id);

            if (error) throw error;
            toast.success("Updated your store assignment!");
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCleanupOthers = async () => {
        if (!currentUser || !currentStore) return;
        if (!confirm(`This will move all OTHER users OUT of ${currentStore.name}. Are you sure?`)) return;

        setProcessing(true);
        try {
            // Find a store that is NOT the current one to dump them in, or just NULL?
            // Ideally we move them to a 'Demo' store if exists, or just the first other store.
            const otherStore = stores.find(s => s.id !== currentStore.id);
            if (!otherStore) {
                toast.error("No other store found to move users to.");
                return;
            }

            // Identify users who are NOT me but are in my store
            const usersToMove = employees.filter(e => e.id !== currentUser.id && e.store_id === currentStore.id);

            if (usersToMove.length === 0) {
                toast.info("No other users found in your store.");
                return;
            }

            const idsToMove = usersToMove.map(e => e.id);

            const { error } = await supabase
                .from('employees')
                .update({ store_id: otherStore.id })
                .in('id', idsToMove);

            if (error) throw error;
            toast.success(`Moved ${idsToMove.length} users to ${otherStore.name}`);
            await loadData();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <PageLayout>
            <PageHeader title="Fix Store Isolation" description="Repair tool for multi-tenant data mixing" />
            <div className="p-6 space-y-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Your Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center">
                            <div className="text-lg">
                                You are: <strong>{currentUser?.full_name}</strong>
                            </div>
                            <div className="text-lg">
                                Assigned Store: <strong className="text-primary">{currentStore?.name || "None"}</strong>
                            </div>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            If this is wrong, select the correct store below.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Select Your Correct Store</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stores.map(store => (
                                <Button
                                    key={store.id}
                                    variant={currentStore?.id === store.id ? "default" : "outline"}
                                    className="h-auto py-4 flex flex-col items-start gap-1"
                                    onClick={() => handleAssignSelf(store.id)}
                                    disabled={processing}
                                >
                                    <span className="font-bold text-lg">{store.name}</span>
                                    <span className="text-xs opacity-70">{store.location || "No location"}</span>
                                    {currentStore?.id === store.id && <Check className="ml-auto w-5 h-5" />}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive">3. Cleanup / Isolation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Currently showing <strong>{employees.length}</strong> employees in your view.
                            If you see users who don't belong to <strong>{currentStore?.name}</strong>, click below to move them to another store.
                        </p>
                        <Button
                            variant="destructive"
                            onClick={handleCleanupOthers}
                            disabled={processing || employees.length <= 1}
                        >
                            {processing ? <Loader2 className="mr-2 animate-spin" /> : null}
                            Move {employees.length - 1} Other Users Away
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
}
