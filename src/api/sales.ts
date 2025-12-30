import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type SalesOrder = Database["public"]["Tables"]["sales_orders"]["Row"];
type SalesOrderInsert = Database["public"]["Tables"]["sales_orders"]["Insert"];
type SalesItemInsert = Database["public"]["Tables"]["sales_items"]["Insert"];

export const useSalesOrders = () => {
    return useQuery({
        queryKey: ["sales_orders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales_orders")
                .select(`
          *,
          customer:contacts(name)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useSalesOrder = (id: string) => {
    return useQuery({
        queryKey: ["sales_orders", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales_orders")
                .select(`
          *,
          customer:contacts(*),
          items:sales_items(
            *,
            product:products(name, sku, unit:product_units(name))
          ),
          payments:sales_payments(*)
        `)
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};

type CreateSaleParams = {
    order: SalesOrderInsert;
    items: Omit<SalesItemInsert, "sale_id">[];
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ order, items }: CreateSaleParams) => {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert({ ...order, status: 'Completed' })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Items & Decrease Stock
            if (items.length > 0) {
                const itemsWithId = items.map((item) => ({
                    ...item,
                    sale_id: orderData.id,
                }));

                // Insert items
                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithId);

                if (itemsError) throw itemsError;

                // Decrease Stock for each item
                for (const item of items) {
                    if (item.product_id) {
                        const { data: product } = await supabase
                            .from('products')
                            .select('current_stock')
                            .eq('id', item.product_id)
                            .single();

                        if (product) {
                            const newStock = Math.max(0, (product.current_stock || 0) - item.quantity);
                            await supabase
                                .from('products')
                                .update({ current_stock: newStock })
                                .eq('id', item.product_id);
                        }
                    }
                }
            }

            // 3. Create Initial Payment if applicable
            // @ts-ignore
            if (order.paid_amount && order.paid_amount > 0) {
                const { error: paymentError } = await supabase
                    .from("sales_payments")
                    .insert({
                        sale_id: orderData.id,
                        // @ts-ignore
                        amount: order.paid_amount,
                        payment_date: order.order_date,
                        payment_method: 'Cash', // Default for initial
                        notes: 'Initial Payment'
                    });

                if (paymentError) throw paymentError;
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useAddSalePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sale_id, amount, date, method, notes }: { sale_id: string; amount: number; date: string; method: string; notes?: string }) => {
            // 1. Add Payment Record
            const { error: paymentError } = await supabase
                .from("sales_payments")
                .insert({
                    sale_id,
                    amount,
                    payment_date: date,
                    payment_method: method,
                    notes
                });

            if (paymentError) throw paymentError;

            // 2. Fetch current order to get total paid
            const { data: order, error: fetchError } = await supabase
                .from("sales_orders")
                .select("total_amount, paid_amount")
                .eq("id", sale_id)
                .single();

            if (fetchError) throw fetchError;

            const currentPaid = Number(order.paid_amount || 0);
            const newPaid = currentPaid + amount;
            const total = Number(order.total_amount || 0);

            let status = 'Unpaid';
            if (newPaid >= total) status = 'Paid';
            else if (newPaid > 0) status = 'Partial';

            // 3. Update Order
            const { data: updatedOrder, error: updateError } = await supabase
                .from("sales_orders")
                .update({
                    paid_amount: newPaid,
                    payment_status: status
                } as any)
                .eq("id", sale_id)
                .select()
                .single();

            if (updateError) throw updateError;
            return updatedOrder;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
            queryClient.invalidateQueries({ queryKey: ["sales_orders", data.id] });
        },
    });
};
