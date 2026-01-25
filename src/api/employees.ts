import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Employee, EmployeeTask, Attendance } from "@/types/employee";
import { toast } from "@/components/ui/use-toast";
import { useAppSelector } from "@/store/hooks";

// --- Employees Hooks ---

export const useEmployees = (opts?: { allStores?: boolean }) => {
    const activeStoreId = useAppSelector((state) => state.store.activeStoreId);
    const availableStores = useAppSelector((state) => state.store.availableStores);

    // If showing all stores, we don't need activeStoreId
    const enabled = opts?.allStores ? true : !!activeStoreId;

    return useQuery({
        queryKey: ["employees", activeStoreId],
        queryFn: async () => {
            if (!activeStoreId) return [];

            // Fetch employees. If allStores is true, fetch all (Admin). Else filter by store.
            let query = supabase
                .from("employees")
                .select("*, store:stores(name)")
                .order("created_at", { ascending: false });

            if (!opts?.allStores && activeStoreId) {
                query = query.eq("store_id", activeStoreId);
            }

            const { data, error } = await query;

            if (error) {
                toast({ title: "Error fetching employees", description: error.message, variant: "destructive" });
                throw error;
            }
            const employees = data as Employee[];

            // 2. Virtual Admin Injection
            // If the Store Owner is not in the list (because their primary 'employee' record is in another store),
            // we inject them as a virtual admin so they appear in the UI.
            if (!opts?.allStores && activeStoreId) {
                const currentStore = availableStores.find(s => s.id === activeStoreId);

                // Fetch store owner for active store
                const { data: storeDetails } = await supabase
                    .from("stores")
                    .select("owner_id")
                    .eq("id", activeStoreId)
                    .single();

                if (storeDetails?.owner_id) {
                    const isOwnerInList = employees.some(e => e.id === storeDetails.owner_id);

                    if (!isOwnerInList) {
                        try {
                            // Fetch Owner's profile from their "Main" record
                            const { data: ownerProfile } = await supabase
                                .from("employees")
                                .select("*, store:stores(name)")
                                .eq("id", storeDetails.owner_id)
                                .maybeSingle();

                            if (ownerProfile) {
                                // Create a Virtual Clone for this store
                                const virtualAdmin: Employee = {
                                    ...ownerProfile,
                                    store_id: activeStoreId, // Pretend they are in this store
                                    role: 'admin', // Always Admin
                                    store: { name: currentStore?.name || "Current Store" }
                                };
                                // Prepend owner
                                employees.unshift(virtualAdmin);
                            }
                        } catch (err) {
                            console.warn("Failed to inject virtual owner", err);
                        }
                    }
                }
            }

            return employees;
        },
        enabled
    });
};

export const useCurrentEmployee = () => {
    return useQuery({
        queryKey: ["current_employee"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            // Fallback: If employee profile doesn't have email, use data from Auth
            if (!data.email && user.email) {
                data.email = user.email;
            }

            return data as Employee;
        },
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();
    const activeStoreId = useAppSelector((state) => state.store.activeStoreId);

    return useMutation({
        mutationFn: async (employee: Partial<Employee>) => {
            if (!activeStoreId) throw new Error("No active store selected");

            // Allow overriding store_id if passed (e.g. from dropdown), otherwise use active
            const targetStoreId = employee.store_id || activeStoreId;

            const { data, error } = await supabase.from("employees").insert({
                ...employee,
                store_id: targetStoreId
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

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (employeeId: string) => {
            const { error } = await supabase
                .from("employees")
                .delete()
                .eq("id", employeeId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toast({ title: "Employee deleted successfully" });
        },
        onError: (error: any) => {
            toast({ title: "Failed to delete employee", description: error.message, variant: "destructive" });
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
            // 1. Get current user's store_id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: currentUserData, error: userError } = await supabase
                .from("employees")
                .select("store_id")
                .eq("user_id", user.id)
                .single();

            if (userError) throw userError;

            // 2. Fetch attendance for employees in this store
            // We use !inner join to filter attendance by the related employee's store_id
            const { data, error } = await supabase
                .from("attendance")
                .select("*, employees!inner(full_name, store_id)")
                .eq("date", queryDate)
                .eq("employees.store_id", currentUserData.store_id);

            if (error) throw error;
            return data as (Attendance & { employees: { full_name: string } })[];
        }
    });
};

export const useMyTodayAttendance = () => {
    return useQuery({
        queryKey: ["my_today_attendance"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const today = new Date().toISOString().split('T')[0];

            // Get internal ID
            const { data: emp } = await supabase
                .from("employees")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!emp) return null;

            const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .eq("employee_id", emp.id)
                .eq("date", today)
                .maybeSingle(); // Use maybeSingle as it might not exist yet

            if (error) throw error;
            return data;
        }
    });
};


export const useCheckIn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ location }: { location?: any; employeeId?: string }) => { // employeeId is now ignored
            // 1. Get current authenticated user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 2. Fetch the correct internal Employee ID
            const { data: employeeData, error: empError } = await supabase
                .from("employees")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (empError || !employeeData) throw new Error("Employee profile not found");
            const internalEmployeeId = employeeData.id;

            const today = new Date().toISOString().split('T')[0];

            // 3. Check if already checked in today (Double check purely for better error message, DB constraint handles race conditions)
            const { data: existing } = await supabase
                .from("attendance")
                .select("id")
                .eq("employee_id", internalEmployeeId)
                .eq("date", today)
                .single();

            if (existing) {
                throw new Error("You have already checked in today.");
            }

            // 4. Perform Check-in
            const { data, error } = await supabase.from("attendance").insert({
                employee_id: internalEmployeeId,
                check_in: new Date().toISOString(),
                date: today,
                status: 'present',
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
            // Handle duplicate key error gracefully if race condition occurs
            if (error.code === '23505') { // Postgres unique violation code
                toast({ title: "Already Checked In", description: "You have already checked in for today.", variant: "destructive" });
            } else {
                toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
            }
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
// ... existing code ...

export const useTeamMembers = () => {
    return useQuery({
        queryKey: ["team_members"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data: currentUserData } = await supabase
                .from("employees")
                .select("store_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!currentUserData) return []; // User not linked to employee, return empty team

            const { data, error } = await supabase
                .from("employees")
                .select(`
                    id, 
                    full_name, 
                    role, 
                    employee_tasks (
                        title,
                        status,
                        created_at
                    )
                `)
                .eq("store_id", currentUserData.store_id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Process to attach only the "latest" task
            return data.map((emp: any) => {
                // Sort tasks by created_at desc
                const tasks = emp.employee_tasks?.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ) || [];
                return {
                    ...emp,
                    latest_task: tasks[0] || null
                };
            });
        },
    });
};
