import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Deal {
    id: string;
    title: string;
    contact_id: string;
    value: number;
    status: string;
    created_at: string;
    contacts?: {
        company: string;
        name: string;
    };
}

export const useDeals = () => {
    return useQuery({
        queryKey: ["deals"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("deals")
                .select("*, contacts(name, company)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Deal[];
        },
    });
};

export const useCreateDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (deal: Partial<Deal>) => {
            const { data, error } = await supabase
                .from("deals")
                .insert([deal])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
            toast.success("Deal created successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create deal");
        },
    });
};

export const useUpdateDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Deal> & { id: string }) => {
            const { data, error } = await supabase
                .from("deals")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
            // toast.success("Deal updated"); // Optional: strict mode might annoy users on drag-drop
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update deal");
        },
    });
};

export const useDeleteDeal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("deals")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
            toast.success("Deal deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete deal");
        },
    });
};
