import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";

export type Category = Database["public"]["Tables"]["product_categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["product_categories"]["Insert"];
export type SubCategory = Database["public"]["Tables"]["product_sub_categories"]["Row"];
export type SubCategoryInsert = Database["public"]["Tables"]["product_sub_categories"]["Insert"];
export type Brand = Database["public"]["Tables"]["product_brands"]["Row"];
export type BrandInsert = Database["public"]["Tables"]["product_brands"]["Insert"];
export type Unit = Database["public"]["Tables"]["product_units"]["Row"];
export type UnitInsert = Database["public"]["Tables"]["product_units"]["Insert"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

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

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Category) => {
            // Remove readonly timestamp fields to avoid format errors
            // @ts-ignore
            delete updates.created_at;
            // @ts-ignore
            delete updates.updated_at;

            const { data, error } = await supabase
                .from("product_categories")
                .update(updates)
                .eq("id", id)
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

// ... (Sub Categories) ...

export const useUpdateSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: SubCategory) => {
            // @ts-ignore
            delete updates.created_at;
            // @ts-ignore
            delete updates.updated_at;
            // @ts-ignore
            delete updates.category; // also remove joined relation if present

            const { data, error } = await supabase
                .from("product_sub_categories")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_sub_categories"] });
        },
    });
};

// ... (Brands) ...

export const useUpdateBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Brand) => {
            // @ts-ignore
            delete updates.created_at;
            // @ts-ignore
            delete updates.updated_at;

            const { data, error } = await supabase
                .from("product_brands")
                .update(updates)
                .eq("id", id)
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

// ... (Units) ...

export const useUpdateUnit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Unit) => {
            // @ts-ignore
            delete updates.created_at;
            // @ts-ignore
            delete updates.updated_at;

            const { data, error } = await supabase
                .from("product_units")
                .update(updates)
                .eq("id", id)
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

// Sub Categories
export const useSubCategories = (categoryId?: string) => {
    return useQuery({
        queryKey: ["product_sub_categories", categoryId],
        queryFn: async () => {
            let query = supabase
                .from("product_sub_categories")
                .select("*, category:product_categories(name)")
                .order("name");

            if (categoryId) {
                query = query.eq("category_id", categoryId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60,
    });
};

export const useCreateSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (subCategory: SubCategoryInsert) => {
            const { data, error } = await supabase
                .from("product_sub_categories")
                .insert(subCategory)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_sub_categories"] });
        },
    });
};

// function moved up

export const useDeleteSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("product_sub_categories")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product_sub_categories"] });
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

// function moved up

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

// function moved up

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
          sub_category:product_sub_categories(name),
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

export const useBulkImportProducts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (products: ProductInsert[]) => {
            const { data, error } = await supabase
                .from("products")
                .insert(products)
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
