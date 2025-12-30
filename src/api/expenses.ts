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
