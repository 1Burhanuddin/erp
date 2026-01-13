import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];
type BusinessProfileInsert = Database["public"]["Tables"]["business_profiles"]["Insert"];

export const useBusinessProfile = () => {
    return useQuery({
        queryKey: ["business_profile"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("business_profiles")
                .select("*")
                .maybeSingle();

            if (error) throw error;
            return data;
        },
    });
};

export const useUpdateBusinessProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: BusinessProfileInsert) => {
            // Check if profile exists
            const { data: existing } = await supabase
                .from("business_profiles")
                .select("id")
                .maybeSingle();

            if (existing) {
                const { error } = await supabase
                    .from("business_profiles")
                    .update(data)
                    .eq("id", existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("business_profiles")
                    .insert(data);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["business_profile"] });
        },
    });
};
