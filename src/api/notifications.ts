
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
    id: string;
    created_at: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    link?: string;
}

export const useNotifications = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as Notification[];
        },
        enabled: !!user,
        refetchInterval: 30000, // Poll every 30s
    });
};

export const useUnreadCount = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["notifications", "unread", user?.id],
        queryFn: async () => {
            if (!user) return 0;

            const { count, error } = await supabase
                .from("notifications")
                .select("*", { count: 'exact', head: true })
                .eq("user_id", user.id)
                .eq("read", false);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!user,
        refetchInterval: 30000,
    });
}

export const useMarkAllRead = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async () => {
            if (!user) return;
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", user.id)
                .eq("read", false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};

export const useMarkRead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
};
