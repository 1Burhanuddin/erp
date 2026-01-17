import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type SalesOrder = Database["public"]["Tables"]["sales_orders"]["Row"] & { channel?: string };
type SalesOrderInsert = Database["public"]["Tables"]["sales_orders"]["Insert"] & { channel?: string };
type SalesItemInsert = Database["public"]["Tables"]["sales_items"]["Insert"];
type SalesPaymentInsert = Database["public"]["Tables"]["sales_payments"]["Insert"];

// --- Quotations Hooks ---

export const useQuotations = () => {
    return useQuery({
        queryKey: ["quotations"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales_orders")
                .select(`
                    *,
                    customer:contacts(name),
                    items:sales_items(*)
                `)
                .eq("status", "Quotation")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useQuotation = (id: string) => {
    return useQuery({
        queryKey: ["quotations", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales_orders")
                .select(`
                    *,
                    customer:contacts(*),
                    items:sales_items(
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

export const useCreateQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { order: SalesOrderInsert, items: SalesItemInsert[] }) => {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert({ ...data.order, status: "Quotation" })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Items
            if (data.items.length > 0) {
                const itemsWithOrderId = data.items.map(item => ({
                    ...item,
                    sale_id: orderData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);

                if (itemsError) throw itemsError;
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
        },
    });
};

export const useUpdateQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string, order: Partial<SalesOrderInsert>, items: SalesItemInsert[] }) => {
            // 1. Update Order
            const { error: orderError } = await supabase
                .from("sales_orders")
                .update(data.order)
                .eq("id", data.id);

            if (orderError) throw orderError;

            // 2. Delete existing items (simple replacement strategy)
            const { error: deleteError } = await supabase
                .from("sales_items")
                .delete()
                .eq("sale_id", data.id);

            if (deleteError) throw deleteError;

            // 3. Insert new items
            if (data.items.length > 0) {
                const itemsWithOrderId = data.items.map(item => ({
                    ...item,
                    sale_id: data.id,
                }));
                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);
                if (itemsError) throw itemsError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
        },
    });
};

export const useDeleteQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("sales_orders")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
        },
    });
};

export const useConvertQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            // 1. Fetch Quotation
            const { data: quote, error: fetchError } = await supabase
                .from("sales_orders")
                .select(`*, items:sales_items(*)`)
                .eq("id", id)
                .single();

            if (fetchError) throw fetchError;
            if (!quote) throw new Error("Quotation not found");

            // 2. Create Sales Order
            const { data: newOrder, error: orderError } = await supabase
                .from("sales_orders")
                .insert({
                    customer_id: quote.customer_id,
                    order_date: new Date().toISOString(),
                    total_amount: quote.total_amount,
                    status: "Pending",
                    channel: "Direct",
                    order_no: `SO-${Date.now()}`
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Items
            if (quote.items && quote.items.length > 0) {
                const newItems = quote.items.map((item: any) => ({
                    sale_id: newOrder.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal
                }));

                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(newItems);

                if (itemsError) throw itemsError;
            }

            // 4. Update Quotation Status
            const { error: updateError } = await supabase
                .from("sales_orders")
                .update({ status: "Converted" })
                .eq("id", id);

            if (updateError) throw updateError;

            return newOrder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
            toast.success("Quotation converted to Order successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to convert quotation");
        }
    });
};
// --- Delivery Challan Hooks ---

export const useDeliveryChallans = () => {
    return useQuery({
        queryKey: ["delivery_challans"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales_orders")
                .select(`
                    *,
                    customer:contacts(name),
                    items:sales_items(*)
                `)
                .eq("status", "Delivery Challan")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useCreateDeliveryChallan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { order: SalesOrderInsert, items: SalesItemInsert[] }) => {
            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert({ ...data.order, status: "Delivery Challan" })
                .select()
                .single();

            if (orderError) throw orderError;

            if (data.items.length > 0) {
                const itemsWithOrderId = data.items.map(item => ({
                    ...item,
                    sale_id: orderData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);

                if (itemsError) throw itemsError;
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery_challans"] });
        },
    });
};

export const useUpdateDeliveryChallan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string, order: Partial<SalesOrderInsert>, items: SalesItemInsert[] }) => {
            const { error: orderError } = await supabase
                .from("sales_orders")
                .update(data.order)
                .eq("id", data.id);

            if (orderError) throw orderError;

            const { error: deleteError } = await supabase
                .from("sales_items")
                .delete()
                .eq("sale_id", data.id);

            if (deleteError) throw deleteError;

            if (data.items.length > 0) {
                const itemsWithOrderId = data.items.map(item => ({
                    ...item,
                    sale_id: data.id,
                }));
                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);
                if (itemsError) throw itemsError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery_challans"] });
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
        },
    });
};

export const useDeleteDeliveryChallan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("sales_orders")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery_challans"] });
        },
    });
};
// --- General Sales Hooks (Invoices/Orders) ---

export const useSalesOrders = () => {
    return useQuery({
        queryKey: ["sales_orders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("sales_orders")
                // Fetch everything that is NOT a quotation, assuming 'Quotation' is specific.
                // Or just fetch everything and let UI filter? Existing UI seemed to just show all.
                // But usually Sales Invoices page wants invoices.
                // Let's exclude Quotations to be safe, so they don't clutter the Invoice list.
                .select(`
                    *,
                    customer:contacts(name),
                    items:sales_items(*)
                `)
                .neq("status", "Quotation")
                .neq("status", "Delivery Challan")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
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
                        product:products(name, sku)
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

export const useCreateSalesOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { order: SalesOrderInsert, items: SalesItemInsert[] }) => {
            // 1. Create Order (Status: Pending) - DO NOT DEDUCT STOCK YET
            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert({ ...data.order, status: "Pending", channel: "Direct" })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Items
            if (data.items.length > 0) {
                const itemsWithOrderId = data.items.map(item => ({
                    ...item,
                    sale_id: orderData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);

                if (itemsError) throw itemsError;
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
        },
    });
};

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { order: SalesOrderInsert, items: SalesItemInsert[] }) => {
            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert(data.order)
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Items & Deduct Stock
            if (data.items.length > 0) {
                const itemsWithOrderId = data.items.map(item => ({
                    ...item,
                    sale_id: orderData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);

                if (itemsError) throw itemsError;

                // Update Stock
                for (const item of data.items) {
                    await updateProductStock(item.product_id, item.quantity, 'Decrease');
                }
            }

            return orderData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
        },
    });
};

export const useAddSalePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payment: SalesPaymentInsert) => {
            // 1. Add Payment
            const { data: paymentData, error: paymentError } = await supabase
                .from("sales_payments")
                .insert(payment)
                .select()
                .single();

            if (paymentError) throw paymentError;

            // 2. Update Sales Order Totals
            // First fetch current order
            const { data: order, error: fetchError } = await supabase.from("sales_orders").select("total_amount, paid_amount").eq("id", payment.sale_id).single();
            if (fetchError) throw fetchError;

            const newPaidAmount = (order.paid_amount || 0) + payment.amount;
            let newStatus = 'Partial';
            if (newPaidAmount >= order.total_amount) newStatus = 'Paid';

            const { error: updateError } = await supabase
                .from("sales_orders")
                .update({ paid_amount: newPaidAmount, payment_status: newStatus })
                .eq("id", payment.sale_id);

            if (updateError) throw updateError;

            return paymentData;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["sales_orders", variables.sale_id] });
            queryClient.invalidateQueries({ queryKey: ["sales_orders"] });
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
