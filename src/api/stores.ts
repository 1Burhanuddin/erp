
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
            const { data, error } = await supabase
                .from("stores")
                .insert(store)
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
