import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

export interface DashboardReport {
    totalRevenue: number;
    totalOrders: number;
    totalExpenses: number;
    netProfit: number;
    monthlySales: {
        month: string;
        sales: number;
        orders: number;
    }[];
    categoryDistribution: {
        name: string;
        value: number;
        color: string;
    }[];
}

export const useReports = () => {
    return useQuery({
        queryKey: ["reports"],
        queryFn: async (): Promise<DashboardReport> => {
            // 1. Fetch Sales Orders (Global)
            const { data: sales, error: salesError } = await supabase
                .from("sales_orders")
                .select("total_amount, order_date")
                .neq("status", "Cancelled");

            if (salesError) throw salesError;

            // 2. Fetch Expenses (Global)
            const { data: expenses, error: expensesError } = await supabase
                .from("expenses")
                .select("amount");

            if (expensesError) throw expensesError;

            // 3. Fetch Sales Items with Product Categories for Pie Chart
            // We need to join: sales_items -> products -> product_categories
            const { data: salesItems, error: itemsError } = await supabase
                .from("sales_items")
                .select(`
                    quantity,
                    subtotal,
                    products (
                        category_id,
                        product_categories (
                            name
                        )
                    )
                `);

            if (itemsError) throw itemsError;

            // --- Aggregations ---

            // A. Totals
            const totalRevenue = sales?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
            const totalOrders = sales?.length || 0;
            const totalExpenses = expenses?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;
            const netProfit = totalRevenue - totalExpenses;

            // B. Monthly Sales (Last 6 Months)
            const today = new Date();
            const last6Months = eachMonthOfInterval({
                start: subMonths(today, 5),
                end: today
            });

            const monthlySales = last6Months.map(date => {
                const monthStart = startOfMonth(date);
                const monthEnd = endOfMonth(date);
                const monthLabel = format(date, "MMM"); // Jan, Feb...

                const monthlyOrders = sales?.filter(order => {
                    const orderDate = new Date(order.order_date);
                    return orderDate >= monthStart && orderDate <= monthEnd;
                }) || [];

                const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

                return {
                    month: monthLabel,
                    sales: monthlyRevenue,
                    orders: monthlyOrders.length
                };
            });

            // C. Category Distribution
            // Group salesItems by category name
            const categoryMap = new Map<string, number>();

            salesItems?.forEach((item: any) => {
                const categoryName = item.products?.product_categories?.name || "Uncategorized";
                const value = Number(item.subtotal) || 0; // Using value magnitude (revenue contribution)
                // Alternatively use quantity if preferred: const value = item.quantity;

                categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + value);
            });

            // Colors for charts
            const COLORS = [
                "hsl(217, 91%, 60%)", // Primary Blue
                "hsl(142, 76%, 36%)", // Success Green
                "hsl(38, 92%, 50%)",  // Warning Yellow
                "hsl(199, 89%, 48%)", // Info Cyan
                "hsl(262, 83%, 58%)", // Purple
                "hsl(340, 82%, 52%)", // Pink
            ];

            const categoryDistribution = Array.from(categoryMap.entries())
                .map(([name, value], index) => ({
                    name,
                    value,
                    color: COLORS[index % COLORS.length]
                }))
                .sort((a, b) => b.value - a.value) // Sort by highest value
                .slice(0, 5); // Top 5 categories

            // If "Other" needed, you could sum the rest here, but Top 5 is usually enough for UI

            return {
                totalRevenue,
                totalOrders,
                totalExpenses,
                netProfit,
                monthlySales,
                categoryDistribution
            };
        }
    });
};
