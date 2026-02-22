import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { normalizeHostname, isERPDomain } from "@/config/domains";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["product_categories"]["Row"];

export const useStoreProducts = (storeId?: string, categoryId?: string) => {
    return useQuery({
        queryKey: ["ecommerce_products", storeId, categoryId],
        queryFn: async () => {
            if (!storeId) return [];

            const { data, error } = await supabase
                .from("store_products")
                .select(`
                    is_active,
                    product:products(
                        *,
                        category:product_categories(name),
                        brand:product_brands(name)
                    )
                `)
                .eq("store_id", storeId)
                .eq("is_active", true)
                .eq("product.is_online", true);

            if (error) throw error;

            // Reformat data to match Product type
            let formattedData = (data as any[])
                .map(item => item.product)
                .filter(p => !!p);

            if (categoryId) {
                formattedData = formattedData.filter(p => p.category_id === categoryId);
            }

            return formattedData;
        },
        enabled: !!storeId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useStoreCategories = (storeId?: string) => {
    return useQuery({
        queryKey: ["ecommerce_categories", storeId],
        queryFn: async () => {
            if (!storeId) return [];

            // Get distinct categories from products available in this store
            const { data, error } = await supabase
                .from("store_products")
                .select(`
                    product:products(
                        category:product_categories(*)
                    )
                `)
                .eq("store_id", storeId)
                .eq("is_active", true);

            if (error) throw error;

            const categoriesMap = new Map<string, Category>();
            (data as any[]).forEach(item => {
                if (item.product?.category) {
                    const cat = item.product.category;
                    // Deduplicate by name to handle potential duplicate DB entries
                    const key = cat.name?.toLowerCase().trim() || cat.id;
                    if (!categoriesMap.has(key)) {
                        categoriesMap.set(key, cat);
                    }
                }
            });

            return Array.from(categoriesMap.values()).sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
        },
        enabled: !!storeId,
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
    store_id?: string;
};

export const useCreateEcommerceOrder = () => {
    return useMutation({
        mutationFn: async ({ customer, items, total_amount, store_id }: CreateEcommerceOrderParams) => {
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
            // Use provided store_id or fall back to the first one found
            let finalStoreId = store_id;
            if (!finalStoreId) {
                const { data: stores } = await supabase.from("stores").select("id").limit(1);
                finalStoreId = stores?.[0]?.id;
            }

            const { data: orderData, error: orderError } = await supabase
                .from("sales_orders")
                .insert({
                    customer_id: customerId,
                    store_id: finalStoreId,
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

export const useStoreDetails = (slug?: string) => {
    return useQuery({
        queryKey: ["ecommerce_store_details", slug],
        queryFn: async () => {
            const hostname = normalizeHostname(window.location.hostname);
            let query = supabase
                .from("stores")
                .select("id, name, address, phone, email, domain");

            if (slug) {
                // Try matching by slug as is first, then normalized if it looks like a domain
                const normalizedSlug = normalizeHostname(slug);
                query = query.or(`domain.eq.${slug},domain.eq.${normalizedSlug}`);
            } else if (hostname !== 'localhost' && !isERPDomain(hostname)) {
                // If on a custom domain, resolve by normalized hostname
                // Fallback: If domain column is empty, match by store name for known domains
                if (hostname === 'tajglass.in') {
                    query = query.or(`domain.eq.${hostname},name.ilike.%Taj Glass%`);
                } else if (hostname === 'asvac.in') {
                    query = query.or(`domain.eq.${hostname},name.ilike.%ASVAC%`);
                } else {
                    query = query.eq("domain", hostname);
                }
            } else {
                query = query.limit(1);
            }

            const { data, error } = await query.maybeSingle();

            // Fallback 1: If hostname resolution fails on a custom domain, 
            // try to fetch the first store instead of failing completely.
            // This handles cases where the 'domain' column isn't set up yet.
            if ((!data || error) && !slug && hostname !== 'localhost' && !isERPDomain(hostname)) {
                const { data: fallbackData } = await supabase
                    .from("stores")
                    .select("id, name, address, phone, email, domain")
                    .limit(1)
                    .maybeSingle();

                if (fallbackData) return fallbackData;
            }

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
