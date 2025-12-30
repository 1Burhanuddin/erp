
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useContacts = () => {
    return useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contacts')
                .select('*');

            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            // For now, simpler implementation fetching counts
            // In a real scenario, this might involve an RPC call or a specific aggregate table

            const { count: customersCount } = await supabase
                .from('contacts')
                .select('*', { count: 'exact', head: true });

            const { count: dealsCount } = await supabase
                .from('deals')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

            // Mocking other stats for now as we don't have complex aggregation logic backend side yet
            return [
                {
                    title: "Total Customers",
                    value: customersCount?.toLocaleString() || "0",
                    trend: { value: 12, isPositive: true },
                    iconType: 'users'
                },
                {
                    title: "Revenue",
                    value: "$50,234",
                    trend: { value: 8, isPositive: true },
                    iconType: 'dollar'
                },
                {
                    title: "Active Deals",
                    value: dealsCount?.toString() || "0",
                    trend: { value: 5, isPositive: false },
                    iconType: 'target'
                },
                {
                    title: "Win Rate",
                    value: "68%",
                    trend: { value: 3, isPositive: true },
                    iconType: 'award'
                }
            ];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useDashboardCharts = () => {
    return useQuery({
        queryKey: ['dashboard-charts'],
        queryFn: async () => {
            const { data: lineData, error: lineError } = await supabase
                .from('dashboard_chart_data')
                .select('*')
                .order('id');

            const { data: barData, error: barError } = await supabase
                .from('dashboard_bar_data')
                .select('*')
                .order('id');

            if (lineError) throw lineError;
            if (barError) throw barError;

            return {
                lineChart: lineData,
                barChart: barData
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
