
import { useEffect } from "react";
import { Check, ChevronsUpDown, Store as StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveStoreId, setAvailableStores, setLoading } from "@/store/slices/storeSlice";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function StoreSwitcher() {
    const dispatch = useAppDispatch();
    const { activeStoreId, availableStores } = useAppSelector((state) => state.store);
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchStores = async () => {
            if (!user) return;
            dispatch(setLoading(true));

            try {
                // 1. Get Employee Record to check Role
                // We use 'maybeSingle' because checking 'role' is safer than assuming admin
                const { data: emp, error: empError } = await supabase
                    .from("employees")
                    .select("store_id, role")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (empError) throw empError;

                let storesData = [];

                if (emp && emp.role === 'admin') {
                    // 2a. Admin: Fetch ALL active stores
                    // Note: In a real "SaaS" with multiple tenants, we'd still filter by some "owner_id" or organization.
                    // But here, "admin" means "owner of the ERP instance".
                    const { data: allStores, error: storesError } = await supabase
                        .from("stores")
                        .select("id, name, is_active")
                        .eq("is_active", true) // Only active stores? Maybe default to active.
                        .order("name");

                    if (storesError) throw storesError;
                    storesData = allStores || [];
                } else if (emp && emp.store_id) {
                    // 2b. Regular Employee: Fetch only THEIR store
                    const { data: myStore, error: storeError } = await supabase
                        .from("stores")
                        .select("id, name, is_active")
                        .eq("id", emp.store_id)
                        .single();

                    if (storeError) throw storeError;
                    if (myStore) storesData = [myStore];
                }

                dispatch(setAvailableStores(storesData));
            } catch (error) {
                console.error("Failed to fetch stores for switcher", error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchStores();
    }, [user, dispatch]);

    const activeStore = availableStores.find((store) => store.id === activeStoreId);

    if (availableStores.length <= 1 && !activeStoreId) return null; // Don't show if 0 or 1 store (and it's auto-selected)? 
    // Actually, showing it even if 1 is good context.

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-9 justify-between ml-2 transition-all duration-300",
                        "w-10 px-0 md:w-[200px] md:px-3" // Always compact on mobile
                    )}
                >
                    {activeStore ? (
                        <div className="flex items-center gap-2 truncate justify-center md:justify-start w-full">
                            <StoreIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate hidden md:inline tracking-tight text-sm font-medium">
                                {activeStore.name}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center w-full">
                            <StoreIcon className="h-4 w-4 shrink-0 text-muted-foreground md:mr-2" />
                            <span className="text-muted-foreground text-xs md:text-sm hidden md:inline text-nowrap">Select Store...</span>
                        </div>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 hidden md:inline" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search store..." />
                    <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        <CommandGroup>
                            {availableStores.map((store) => (
                                <CommandItem
                                    key={store.id}
                                    value={store.name} // Search by name
                                    onSelect={() => {
                                        dispatch(setActiveStoreId(store.id));
                                        setOpen(false);
                                        // Optional: Reload page to ensure all fresh data?
                                        // window.location.reload(); 
                                        // Better: React Query invalidation in background.
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            activeStoreId === store.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {store.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
