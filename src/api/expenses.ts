// ... existing imports ...
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];

export const useExpenses = () => {
    return useQuery({
        queryKey: ["expenses"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("expenses")
                .select(`
          *,
          category:expense_categories(name)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (expense: ExpenseInsert) => {
            const { data, error } = await supabase
                .from("expenses")
                .insert(expense)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};

export const useExpense = (id: string) => {
    return useQuery({
        queryKey: ["expenses", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("expenses")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...expense }: ExpenseInsert & { id: string }) => {
            const { data, error } = await supabase
                .from("expenses")
                .update(expense)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("expenses")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
};

export const useExpenseCategories = () => {
    return useQuery({
        queryKey: ["expense_categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("expense_categories")
                .select("*")
                .order("name");

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useCreateExpenseCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (category: { name: string; description?: string }) => {
            const { data, error } = await supabase
                .from("expense_categories")
                .insert(category)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
        },
    });
};

export const useUpdateExpenseCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...category }: { id: string; name: string; description?: string }) => {
            const { data, error } = await supabase
                .from("expense_categories")
                .update(category)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
        },
    });
};

export const useDeleteExpenseCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("expense_categories")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense_categories"] });
        },
    });
};
