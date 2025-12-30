import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useStockAdjustments = () => {
    return useQuery({
        queryKey: ["stock_adjustments"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("stock_adjustments")
                .select(`
                    *,
                    items:stock_adjustment_items(
                        *,
                        product:products(name, sku)
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useStockAdjustment = (id: string) => {
    return useQuery({
        queryKey: ["stock_adjustments", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("stock_adjustments")
                .select(`
                    *,
                    items:stock_adjustment_items(
                        *,
                        product:products(name, sku)
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

type CreateAdjustmentParams = {
    adjustment: {
        reference_no: string;
        adjustment_date: string;
        reason: string;
        notes?: string;
    };
    items: {
        product_id: string;
        quantity: number;
        type: 'Increase' | 'Decrease';
    }[];
};

export const useCreateStockAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ adjustment, items }: CreateAdjustmentParams) => {
            // 1. Create Adjustment Record
            const { data: adjData, error: adjError } = await supabase
                .from("stock_adjustments")
                .insert(adjustment)
                .select()
                .single();

            if (adjError) throw adjError;

            // 2. Create Items & Update Product Stock
            if (items.length > 0) {
                const itemsWithId = items.map((item) => ({
                    ...item,
                    adjustment_id: adjData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("stock_adjustment_items")
                    .insert(itemsWithId);

                if (itemsError) throw itemsError;

                // Update Stock for each item
                for (const item of items) {
                    await updateProductStock(item.product_id, item.quantity, item.type);
                }
            }

            return adjData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock_adjustments"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useDeleteStockAdjustment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            // 1. Fetch items to reverse stock
            const { data: items, error: fetchError } = await supabase
                .from("stock_adjustment_items")
                .select("*")
                .eq("adjustment_id", id);

            if (fetchError) throw fetchError;

            // 2. Reverse Stock
            for (const item of items || []) {
                // Reverse the operation: Increase -> Decrease, Decrease -> Increase
                const reverseType = item.type === 'Increase' ? 'Decrease' : 'Increase';
                await updateProductStock(item.product_id, item.quantity, reverseType);
            }

            // 3. Delete Record (Cascade will delete items)
            const { error: deleteError } = await supabase
                .from("stock_adjustments")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock_adjustments"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

// Helper to update product stock
async function updateProductStock(productId: string, quantity: number, type: 'Increase' | 'Decrease') {
    const { data: product } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', productId)
        .single();

    if (product) {
        let newStock = product.current_stock || 0;
        if (type === 'Increase') {
            newStock += quantity;
        } else {
            newStock = Math.max(0, newStock - quantity);
        }

        await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', productId);
    }
}
