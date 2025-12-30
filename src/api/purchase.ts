import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type PurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Row"];
type PurchaseOrderInsert = Database["public"]["Tables"]["purchase_orders"]["Insert"];
type PurchaseItemInsert = Database["public"]["Tables"]["purchase_items"]["Insert"];

export const usePurchaseOrders = () => {
    return useQuery({
        queryKey: ["purchase_orders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("purchase_orders")
                .select(`
          *,
          supplier:contacts(name)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const usePurchaseOrder = (id: string) => {
    return useQuery({
        queryKey: ["purchase_orders", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("purchase_orders")
                .select(`
          *,
          supplier:contacts(*),
          items:purchase_items(
            *,
            product:products(name, sku, unit:product_units(name))
          )
        `)
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};

type CreateOrderParams = {
    order: PurchaseOrderInsert;
    items: Omit<PurchaseItemInsert, "purchase_id">[];
};

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ order, items }: CreateOrderParams) => {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from("purchase_orders")
                .insert({ ...order, status: 'Received' }) // Force status to Received
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Items & Update Stock
            if (items.length > 0) {
                const itemsWithid = items.map((item) => ({
                    ...item,
                    purchase_id: orderData.id,
                }));

                // Insert items
                const { error: itemsError } = await supabase
                    .from("purchase_items")
                    .insert(itemsWithid);

                if (itemsError) throw itemsError;

                // Update Stock for each item
                // We do this sequentially to ensure correctness
                for (const item of items) {
                    if (item.product_id) {
                        // Fetch current stock first (to be safe against race conditions if we had them, 
                        // though here mostly to get the current number)
                        const { data: product } = await supabase
                            .from('products')
                            .select('current_stock')
                            .eq('id', item.product_id)
                            .single();

                        if (product) {
                            const newStock = (product.current_stock || 0) + item.quantity;
                            await supabase
                                .from('products')
                                .update({ current_stock: newStock })
                                .eq('id', item.product_id);
                        }
                    }
                }
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] }); // Also refresh products to show new stock
        },
    });
};

export const useDeletePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            // Ideally we should also decrease stock when deleting, 
            // but for now we just delete the record as per "soft" requirements.
            // If strict inventory management is needed, we'd reverse the operations.
            const { error } = await supabase
                .from("purchase_orders")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
        },
    });
};
