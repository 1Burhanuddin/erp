
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useStores = () => {
    return useQuery({
        queryKey: ["stores"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("stores")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useCreateStore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (store: { name: string; domain?: string; description?: string }) => {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 2. Create Store
            const { data: storeData, error: storeError } = await supabase
                .from("stores")
                .insert(store)
                .select()
                .single();

            if (storeError) throw storeError;

            // 3. Link User as Employee (Admin)
            // Check if employee record already exists
            const { data: existingEmp } = await supabase
                .from("employees")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (existingEmp) {
                // Update existing employee to point to this new store (or maybe keep old? 
                // For now, assuming single-store or "switch focus" model, let's update it so they can use it immediately)
                await supabase
                    .from("employees")
                    .update({ store_id: storeData.id, role: 'admin' }) // Ensure they are admin
                    .eq("id", existingEmp.id);
            } else {
                // Create new employee record
                await supabase
                    .from("employees")
                    .insert({
                        user_id: user.id,
                        store_id: storeData.id,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin",
                        email: user.email,
                        role: 'admin',
                        joining_date: new Date().toISOString(),
                        salary: 0, // Default for owner/admin
                        status: 'active'
                    });
            }

            return storeData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
            queryClient.invalidateQueries({ queryKey: ["employees"] }); // Invalidate employees too
            queryClient.invalidateQueries({ queryKey: ["current_employee"] });
        },
    });
};

export const useUpdateStore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: {
            id: string;
            name?: string;
            domain?: string;
            description?: string;
            is_active?: boolean;
            address?: string;
            phone?: string;
            email?: string;
            website?: string;
            logo_url?: string;
            gstin?: string;
            currency?: string;
            onboarding_completed?: boolean;
        }) => {
            const { data, error } = await supabase
                .from("stores")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
    });
};

export const useDeleteStore = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("stores")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stores"] });
        },
    });
};

// API to get products for a specific store (admin view of the relationship)
export const useStoreProducts = (storeId: string) => {
    return useQuery({
        queryKey: ["store_products", storeId],
        queryFn: async () => {
            // Fetch all products and join with store_products to see status
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          store_products(
            is_active,
            custom_price,
            custom_stock
          )
        `)
                .eq("is_online", true); // Only online products can be in stores? Or all? Let's say all online eligible.

            if (error) throw error;

            // Transform to flatten the structure slightly or just return
            // We need to match with the specific store_id in the array
            return data.map(p => {
                const storeConfig = p.store_products && Array.isArray(p.store_products)
                    ? p.store_products.find((sp: any) => sp.store_id === storeId)
                    : null;

                return {
                    ...p,
                    store_config: storeConfig || null
                };
            });
        },
        enabled: !!storeId
    });
};

// Toggle product availability in a store
export const useToggleStoreProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ storeId, productId, isActive, customPrice }: { storeId: string; productId: string; isActive: boolean; customPrice?: number }) => {
            const { data, error } = await supabase
                .from("store_products")
                .upsert({
                    store_id: storeId,
                    product_id: productId,
                    is_active: isActive,
                    custom_price: customPrice
                }, { onConflict: 'store_id, product_id' })
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["store_products", variables.storeId] });
        },
    });
};
