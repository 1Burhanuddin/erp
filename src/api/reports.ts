import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, startOfDay, endOfDay } from "date-fns";

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

export interface ReportsFilters {
    startDate?: Date;
    endDate?: Date;
}

export const useReports = (filters?: ReportsFilters) => {
    return useQuery({
        queryKey: ["reports", filters?.startDate?.toISOString(), filters?.endDate?.toISOString()],
        queryFn: async (): Promise<DashboardReport> => {
            // Build date filters
            const startDate = filters?.startDate ? startOfDay(filters.startDate).toISOString() : undefined;
            const endDate = filters?.endDate ? endOfDay(filters.endDate).toISOString() : undefined;

            // 1. Fetch Sales Orders (with optional date filtering)
            let salesQuery = supabase
                .from("sales_orders")
                .select("id, total_amount, order_date")
                .neq("status", "Cancelled");

            if (startDate) {
                salesQuery = salesQuery.gte("order_date", startDate);
            }
            if (endDate) {
                salesQuery = salesQuery.lte("order_date", endDate);
            }

            const { data: sales, error: salesError } = await salesQuery;

            if (salesError) throw salesError;

            // 2. Fetch Expenses (with optional date filtering)
            let expensesQuery = supabase
                .from("expenses")
                .select("amount, expense_date");

            if (startDate) {
                expensesQuery = expensesQuery.gte("expense_date", startDate.split('T')[0]);
            }
            if (endDate) {
                expensesQuery = expensesQuery.lte("expense_date", endDate.split('T')[0]);
            }

            const { data: expenses, error: expensesError } = await expensesQuery;

            if (expensesError) throw expensesError;

            // 3. Fetch Sales Items with Product Categories for Pie Chart
            // We need to join: sales_items -> products -> product_categories
            // Also filter by sales order date if date range is provided
            let salesItemsQuery = supabase
                .from("sales_items")
                .select(`
                    quantity,
                    subtotal,
                    sale_id,
                    products (
                        category_id,
                        product_categories (
                            name
                        )
                    )
                `);

            const { data: salesItems, error: itemsError } = await salesItemsQuery;

            // Filter sales items by date range if provided
            let filteredSalesItems = salesItems;
            if ((startDate || endDate) && salesItems) {
                // Get sale_ids that match the date range
                const validSaleIds = new Set(
                    sales
                        ?.filter(order => {
                            const orderDate = new Date(order.order_date);
                            if (startDate && orderDate < new Date(startDate)) return false;
                            if (endDate && orderDate > new Date(endDate)) return false;
                            return true;
                        })
                        .map(order => order.id) || []
                );

                filteredSalesItems = salesItems.filter((item: any) => 
                    validSaleIds.has(item.sale_id)
                );
            }

            if (itemsError) throw itemsError;

            // --- Aggregations ---

            // A. Totals
            const totalRevenue = sales?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
            const totalOrders = sales?.length || 0;
            const totalExpenses = expenses?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;
            const netProfit = totalRevenue - totalExpenses;

            // B. Monthly Sales
            // Determine date range for monthly breakdown
            const dateRangeStart = filters?.startDate || subMonths(new Date(), 5);
            const dateRangeEnd = filters?.endDate || new Date();
            
            const months = eachMonthOfInterval({
                start: startOfMonth(dateRangeStart),
                end: endOfMonth(dateRangeEnd)
            });

            const monthlySales = months.map(date => {
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
            // Group filteredSalesItems by category name
            const categoryMap = new Map<string, number>();

            filteredSalesItems?.forEach((item: any) => {
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
