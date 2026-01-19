import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Employee, EmployeeTask, Attendance } from "@/types/employee";
import { toast } from "@/components/ui/use-toast";

// --- Employees Hooks ---

export const useEmployees = () => {
    return useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            // 1. Get current user's store_id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: currentUserData, error: userError } = await supabase
                .from("employees")
                .select("store_id")
                .eq("user_id", user.id) // Updated column
                .single();

            if (userError) throw userError;

            // 2. Fetch employees for this store
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .eq("store_id", currentUserData.store_id)
                .order("created_at", { ascending: false });

            if (error) {
                toast({ title: "Error fetching employees", description: error.message, variant: "destructive" });
                throw error;
            }
            return data as Employee[];
        },
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employee: Partial<Employee>) => {
            // Get current admin's store_id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: adminData } = await supabase
                .from("employees")
                .select("store_id")
                .eq("user_id", user.id)
                .single();

            if (!adminData?.store_id) throw new Error("Admin not assigned to a store");

            const { data, error } = await supabase.from("employees").insert({
                ...employee,
                store_id: adminData.store_id
            }).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toast({ title: "Employee created successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Failed to create employee", description: error.message, variant: "destructive" });
        },
    });
};

// --- Tasks Hooks ---

export const useEmployeeTasks = (employeeId?: string) => {
    return useQuery({
        queryKey: ["employee_tasks", employeeId],
        queryFn: async () => {
            // 1. Get current user's profile
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: currentUserData, error: userError } = await supabase
                .from("employees")
                .select("store_id, role, id") // Need internal ID too
                .eq("user_id", user.id)
                .single();

            if (userError) throw userError;

            let query = supabase
                .from("employee_tasks")
                .select("*, employees!inner(store_id, full_name)")
                .order("created_at", { ascending: false });

            // 2. Logic Split
            if (currentUserData.role === 'admin') {
                // Admin sees ALL tasks in the store
                query = query.eq("employees.store_id", currentUserData.store_id);
                // Optionally filter by specific employee if param provided
                if (employeeId) {
                    query = query.eq("employee_id", employeeId); // This expects internal ID
                }
            } else {
                // Regular Employee sees ONLY their own tasks
                // The 'employeeId' param is ignored or should match their own.
                // We filter by their internal ID (currentUserData.id)
                query = query.eq("employee_id", currentUserData.id);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as EmployeeTask[];
        },
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (task: Partial<EmployeeTask>) => {
            const { data, error } = await supabase.from("employee_tasks").insert(task).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employee_tasks"] });
            toast({ title: "Task assigned successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Failed to assign task", description: error.message, variant: "destructive" });
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmployeeTask> }) => {
            const { data, error } = await supabase
                .from("employee_tasks")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employee_tasks"] });
            toast({ title: "Task updated" });
        },
        onError: (error: any) => {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        },
    });
};

// --- Attendance Hooks ---

export const useAttendance = (date?: Date) => {
    // Default to today if not provided
    const queryDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    return useQuery({
        queryKey: ["attendance", queryDate],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("attendance")
                .select("*, employees(full_name)")
                .eq("date", queryDate);

            if (error) throw error;
            return data as (Attendance & { employees: { full_name: string } })[];
        }
    })
}


export const useCheckIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ employeeId, location }: { employeeId: string; location?: any }) => {
            const { data, error } = await supabase.from("attendance").insert({
                employee_id: employeeId,
                check_in: new Date().toISOString(),
                date: new Date().toISOString().split('T')[0],
                status: 'present', // Logic for 'late' can be added here or via Trigger
                location_check_in: location
            }).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            toast({ title: "Checked in successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
        },
    });
};

export const useCheckOut = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ attendanceId }: { attendanceId: string }) => {
            const { data, error } = await supabase.from("attendance").update({
                check_out: new Date().toISOString(),
            }).eq("id", attendanceId).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            toast({ title: "Checked out successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Check-out failed", description: error.message, variant: "destructive" });
        },
    });
};
