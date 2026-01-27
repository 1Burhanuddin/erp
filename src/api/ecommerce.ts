import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["product_categories"]["Row"];

export const useStoreProducts = (categoryId?: string) => {
    return useQuery({
        queryKey: ["ecommerce_products", categoryId],
        queryFn: async () => {
            let query = supabase
                .from("products")
                .select(`
                    *,
                    category:product_categories(name),
                    brand:product_brands(name)
                `)
                .eq("is_online", true)
                .order("created_at", { ascending: false });

            if (categoryId) {
                query = query.eq("category_id", categoryId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useStoreCategories = () => {
    return useQuery({
        queryKey: ["ecommerce_categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("product_categories")
                .select("*")
                .order("name");

            if (error) throw error;

            return data as Category[];
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useEcommerceProduct = (id: string) => {
    return useQuery({
        queryKey: ["ecommerce_product", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select(`
                    *,
                    category:product_categories(name),
                    brand:product_brands(name),
                    unit:product_units(name)
                `)
                .eq("id", id)
                .eq("is_online", true)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};

type CreateEcommerceOrderParams = {
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state?: string;
    };
    items: {
        product_id: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
    }[];
    total_amount: number;
};

export const useCreateEcommerceOrder = () => {
    return useMutation({
        mutationFn: async ({ customer, items, total_amount }: CreateEcommerceOrderParams) => {
            // 1. Create or Find Contact (Guest)
            // Ideally we check if email exists. For simplicity, we create a new contact or just use generic one.
            // Let's search by email first.
            let customerId;
            const { data: existingContact } = await supabase
                .from("contacts")
                .select("id")
                .eq("email", customer.email)
                .single();

            if (existingContact) {
                customerId = existingContact.id;
            } else {
                const { data: newContact, error: contactError } = await supabase
                    .from("contacts")
                    .insert({
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        role: "Customer",
                        company: "Online Guest"
                    })
                    .select()
                    .single();

                if (contactError) throw contactError;
                customerId = newContact.id;
            }

            // 2. Create Order
            // Note: We need a store_id. If multiple stores, we need logic. 
            // For now, we pick the first available store or assume single tenant default.
            // If the user is ANON, they don't have a store context in Redux.
            // We'll fetch the first store ID from the database for the demo.
            const { data: stores } = await supabase.from("stores").select("id").limit(1);
            const storeId = stores?.[0]?.id;

            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert({
                    customer_id: customerId,
                    store_id: storeId,
                    order_date: new Date().toISOString(),
                    total_amount: total_amount,
                    status: "Pending",
                    channel: "Online",
                    order_no: `ORD-${Date.now()}`
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Items
            if (items.length > 0) {
                const itemsWithOrderId = items.map(item => ({
                    ...item,
                    sale_id: orderData.id,
                }));

                const { error: itemsError } = await supabase
                    .from("sales_items")
                    .insert(itemsWithOrderId);

                if (itemsError) throw itemsError;
            }

            return orderData;
        }
    });
};

export const useStoreDetails = () => {
    return useQuery({
        queryKey: ["ecommerce_store_details"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("stores")
                .select("name, address, phone, email")
                .limit(1)
                .single();

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
