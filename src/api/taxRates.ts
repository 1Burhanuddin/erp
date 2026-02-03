
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type TaxRate = Database['public']['Tables']['tax_rates']['Row'];
type TaxRateInsert = Database['public']['Tables']['tax_rates']['Insert'];
type TaxRateUpdate = Database['public']['Tables']['tax_rates']['Update'];

export const useTaxRates = (storeId?: string) => {
    return useQuery({
        queryKey: ["tax_rates", storeId],
        queryFn: async () => {
            let query = supabase
                .from("tax_rates")
                .select("*")
                .order("percentage", { ascending: true });

            if (storeId) {
                // Fetch rates for this store OR global rates (store_id is null)
                query = query.or(`store_id.eq.${storeId},store_id.is.null`);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data;
        },
        enabled: true // Always enabled, even if storeId is undefined (fetches all visible)
    });
};

export const useCreateTaxRate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: TaxRateInsert) => {
            const { error } = await supabase
                .from("tax_rates")
                .insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tax_rates"] });
        },
    });
};

export const useUpdateTaxRate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TaxRateUpdate }) => {
            const { error } = await supabase
                .from("tax_rates")
                .update(data)
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tax_rates"] });
        },
    });
};

export const useDeleteTaxRate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("tax_rates")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tax_rates"] });
        },
    });
};
