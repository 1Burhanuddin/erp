
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type TaxRate = Database['public']['Tables']['tax_rates']['Row'];
type TaxRateInsert = Database['public']['Tables']['tax_rates']['Insert'];
type TaxRateUpdate = Database['public']['Tables']['tax_rates']['Update'];

export const useTaxRates = () => {
    return useQuery({
        queryKey: ["tax_rates"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tax_rates")
                .select("*")
                .order("percentage", { ascending: true });

            if (error) throw error;
            return data;
        },
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
