import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ProfileUpdateData {
    full_name?: string;
    avatar_url?: string;
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ProfileUpdateData) => {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: data.full_name,
                    avatar_url: data.avatar_url,
                },
            });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Profile updated successfully");
            // Invalidate user query to refresh UI immediately if we had one,
            // or just rely on the session updating. But reloading window is sometimes safer for Auth state.
            // For now, let's just assume the UI updates from local state or context.
            // We can also invalidate a "user" query if we had one.
            window.location.reload(); // Simple way to refresh all user data in Sidebar/Layout
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update profile");
        }
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: async (password: string) => {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Password updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update password");
        }
    });
};
