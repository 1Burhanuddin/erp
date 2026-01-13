import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AuditLog {
    id: string;
    user_id: string | null;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data: Record<string, any> | null;
    new_data: Record<string, any> | null;
    changed_fields: string[];
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

export interface AuditLogFilters {
    table_name?: string;
    action?: 'INSERT' | 'UPDATE' | 'DELETE';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}

export const useAuditLogs = (filters?: AuditLogFilters) => {
    return useQuery({
        queryKey: ["audit_logs", filters],
        queryFn: async () => {
            let query = supabase
                .from("audit_logs")
                .select("*")
                .order("created_at", { ascending: false });

            if (filters?.table_name) {
                query = query.eq("table_name", filters.table_name);
            }

            if (filters?.action) {
                query = query.eq("action", filters.action);
            }

            if (filters?.startDate) {
                query = query.gte("created_at", filters.startDate.toISOString());
            }

            if (filters?.endDate) {
                query = query.lte("created_at", filters.endDate.toISOString());
            }

            if (filters?.limit) {
                query = query.limit(filters.limit);
            } else {
                query = query.limit(100); // Default limit
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as AuditLog[];
        },
    });
};

export const useAuditLogsForRecord = (tableName: string, recordId: string) => {
    return useQuery({
        queryKey: ["audit_logs", tableName, recordId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("audit_logs")
                .select("*")
                .eq("table_name", tableName)
                .eq("record_id", recordId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as AuditLog[];
        },
    });
};
