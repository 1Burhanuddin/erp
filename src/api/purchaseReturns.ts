import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const usePurchaseReturns = () => {
    return useQuery({
        queryKey: ["purchase_returns"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("purchase_returns")
                .select(`
                    *,
                    purchase:purchase_orders(order_no, supplier:contacts(name)),
                    items:purchase_return_items(
                        *,
                        product:products(name, sku, unit:product_units(name))
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const usePurchaseReturn = (id: string) => {
    return useQuery({
        queryKey: ["purchase_returns", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("purchase_returns")
                .select(`
                    *,
                    purchase:purchase_orders(order_no, supplier:contacts(name)),
                    items:purchase_return_items(
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

type CreateReturnParams = {
    returnBox: {
        purchase_id: string;
        return_date: string;
        reason: string;
        total_refund_amount: number;
    };
    items: {
        product_id: string;
        quantity: number;
        refund_amount: number;
    }[];
};

export const useCreatePurchaseReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ returnBox, items }: CreateReturnParams) => {
            // 1. Create Return Record
            const { data: retData, error: retError } = await supabase
                .from("purchase_returns")
                .insert(returnBox)
                .select()
                .single();

            if (retError) throw retError;

            // 2. Create Items & Update Product Stock (Decrease Stock)
            if (items.length > 0) {
                const itemsWithId = items.map((item) => ({
                    ...item,
                    return_id: retData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("purchase_return_items")
                    .insert(itemsWithId);

                if (itemsError) throw itemsError;

                // Update Stock for each item (Decrease from inventory)
                for (const item of items) {
                    await updateProductStock(item.product_id, item.quantity, 'Decrease');
                }
            }

            return retData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase_returns"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
        },
    });
};

export const useDeletePurchaseReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            // 1. Fetch items to reverse stock
            const { data: items, error: fetchError } = await supabase
                .from("purchase_return_items")
                .select("*")
                .eq("return_id", id);

            if (fetchError) throw fetchError;

            // 2. Reverse Stock (Increase, because we are deleting a return)
            for (const item of items || []) {
                await updateProductStock(item.product_id, item.quantity, 'Increase');
            }

            // 3. Delete Record
            const { error: deleteError } = await supabase
                .from("purchase_returns")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchase_returns"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

// Helper
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
