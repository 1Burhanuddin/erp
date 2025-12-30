import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["product_categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["product_categories"]["Insert"];
type Brand = Database["public"]["Tables"]["product_brands"]["Row"];
type BrandInsert = Database["public"]["Tables"]["product_brands"]["Insert"];
type Unit = Database["public"]["Tables"]["product_units"]["Row"];
type UnitInsert = Database["public"]["Tables"]["product_units"]["Insert"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

// Categories
export const useCategories = () => {
    return useQuery({
        queryKey: ["product_categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("product_categories")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (category: CategoryInsert) => {
            const { data, error } = await supabase
                .from("product_categories")
                .insert(category)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_categories"] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("product_categories")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_categories"] });
        },
    });
};

// Brands
export const useBrands = () => {
    return useQuery({
        queryKey: ["product_brands"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("product_brands")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useCreateBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (brand: BrandInsert) => {
            const { data, error } = await supabase
                .from("product_brands")
                .insert(brand)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_brands"] });
        },
    });
};

export const useDeleteBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("product_brands")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_brands"] });
        },
    });
};

// Units
export const useUnits = () => {
    return useQuery({
        queryKey: ["product_units"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("product_units")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useCreateUnit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (unit: UnitInsert) => {
            const { data, error } = await supabase
                .from("product_units")
                .insert(unit)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_units"] });
        },
    });
};

export const useDeleteUnit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("product_units")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_units"] });
        },
    });
};

// Products
export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          category:product_categories(name),
          brand:product_brands(name),
          unit:product_units(name)
        `)
                .order("name");
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (product: ProductInsert) => {
            const { data, error } = await supabase
                .from("products")
                .insert(product)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
