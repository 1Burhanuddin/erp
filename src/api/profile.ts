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
            window.location.reload();
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

export const useUpdateEmail = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            console.log("Attempting to update email to:", email);
            const { data, error } = await supabase.auth.updateUser({
                email: email,
            });

            if (error) {
                console.error("Supabase Email Update Error:", error);
                throw error;
            }
            return data;
        },
        onSuccess: (data) => {
            if (data.user?.new_email) {
                toast.success(`Confirmation link sent to ${data.user.new_email}. Please check your inbox.`);
            } else {
                toast.success("Email updated successfully");
            }
        },
        onError: (error: any) => {
            console.error("Email Update Mutation Error:", error);
            // 422 usually means validation error or 'same email' or 'already registered'
            let msg = error.message;
            if (error.status === 422) {
                msg = "Unable to update email. This email might be already in use or invalid.";
            }
            toast.error(msg || "Failed to update email");
        }
    });
};
