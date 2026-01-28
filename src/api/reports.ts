import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, startOfDay, endOfDay } from "date-fns";

export interface DashboardReport {
    totalRevenue: number;
    totalOrders: number;
    totalExpenses: number;
    grossProfit: number;
    cogs: number;
    netProfit: number;
    trends: {
        revenue: number;
        orders: number;
        expenses: number;
        profit: number;
    };
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
    topProducts: {
        name: string;
        value: number;
    }[];
    topCustomers: {
        name: string;
        value: number;
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

            // Helper to build queries
            const buildSalesQuery = (start?: string, end?: string) => {
                let q = supabase
                    .from("sales_orders")
                    .select("id, total_amount, order_date, customer:contacts(name)")
                    .neq("status", "Cancelled");
                if (start) q = q.gte("order_date", start);
                if (end) q = q.lte("order_date", end);
                return q;
            };

            const buildExpensesQuery = (start?: string, end?: string) => {
                let q = supabase
                    .from("expenses")
                    .select("amount, expense_date");
                if (start) q = q.gte("expense_date", start.split('T')[0]);
                if (end) q = q.lte("expense_date", end.split('T')[0]);
                return q;
            };

            // 1. Fetch Current Period Data
            const { data: sales, error: salesError } = await buildSalesQuery(startDate, endDate);
            if (salesError) throw salesError;

            const { data: expenses, error: expensesError } = await buildExpensesQuery(startDate, endDate);
            if (expensesError) throw expensesError;

            // 2. Fetch Previous Period Data (for trends)
            let prevSales: any[] | null = [];
            let prevExpenses: any[] | null = [];

            if (filters?.startDate && filters?.endDate) {
                const duration = filters.endDate.getTime() - filters.startDate.getTime();
                const prevEndDate = new Date(filters.startDate.getTime() - 1); // 1ms before start
                const prevStartDate = new Date(prevEndDate.getTime() - duration);

                const pStart = startOfDay(prevStartDate).toISOString();
                const pEnd = endOfDay(prevEndDate).toISOString();

                const { data: pSales } = await buildSalesQuery(pStart, pEnd);
                const { data: pExpenses } = await buildExpensesQuery(pStart, pEnd);

                prevSales = pSales;
                prevExpenses = pExpenses;
            }

            // 3. Fetch Sales Items with Product Categories for Pie Chart
            // We need to join: sales_items -> products -> product_categories
            let salesItemsQuery = supabase
                .from("sales_items")
                .select(`
                    quantity,
                    subtotal,
                    sale_id,
                    products (
                        name,
                        category_id,
                        purchase_price,
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
                const validSaleIds = new Set(sales?.map(order => order.id) || []);
                filteredSalesItems = salesItems.filter((item: any) =>
                    validSaleIds.has(item.sale_id)
                );
            }

            if (itemsError) throw itemsError;

            // --- Aggregations ---

            const calculateTotals = (s: any[], e: any[], items: any[]) => {
                const revenue = s?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
                const orders = s?.length || 0;
                const expensesTotal = e?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;

                // Calculate COGS
                const cogs = items?.reduce((sum, item) => {
                    const purchasePrice = Number(item.products?.purchase_price) || 0;
                    const quantity = Number(item.quantity) || 0;
                    return sum + (purchasePrice * quantity);
                }, 0) || 0;

                const grossProfit = revenue - cogs;
                const netProfit = grossProfit - expensesTotal;

                return { revenue, orders, expensesTotal, cogs, grossProfit, netProfit };
            };

            // Current Totals
            const current = calculateTotals(sales || [], expenses || [], filteredSalesItems || []);

            // For previous period, we'd ideally need prevSalesItems too for precision.
            // For now, we'll use current for profit trend if prev not fully available.
            const previous = calculateTotals(prevSales || [], prevExpenses || [], []);

            // Calculate Trends (percentage change)
            const calculateTrend = (curr: number, prev: number) => {
                if (!prev) return 0; // Avoid division by zero
                return ((curr - prev) / prev) * 100;
            };

            const trends = {
                revenue: calculateTrend(current.revenue, previous.revenue),
                orders: calculateTrend(current.orders, previous.orders),
                expenses: calculateTrend(current.expensesTotal, previous.expensesTotal),
                profit: calculateTrend(current.netProfit, previous.netProfit),
            };

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
            const categoryMap = new Map<string, number>();

            filteredSalesItems?.forEach((item: any) => {
                const categoryName = item.products?.product_categories?.name || "Uncategorized";
                const value = Number(item.subtotal) || 0;
                categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + value);
            });

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
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            // D. Top Products
            const productMap = new Map<string, number>();
            filteredSalesItems?.forEach((item: any) => {
                const productData = item.products;
                const productName = Array.isArray(productData)
                    ? productData[0]?.name
                    : (productData?.name || "Unknown Product");

                const value = Number(item.subtotal) || 0;
                productMap.set(productName, (productMap.get(productName) || 0) + value);
            });

            const topProducts = Array.from(productMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            // E. Top Customers
            const customerMap = new Map<string, number>();
            sales?.forEach((order: any) => {
                const customerData = order.customer;
                const customerName = Array.isArray(customerData)
                    ? customerData[0]?.name
                    : (customerData?.name || "Unknown Customer");

                const value = Number(order.total_amount) || 0;
                customerMap.set(customerName, (customerMap.get(customerName) || 0) + value);
            });

            const topCustomers = Array.from(customerMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            return {
                totalRevenue: current.revenue,
                totalOrders: current.orders,
                totalExpenses: current.expensesTotal,
                grossProfit: current.grossProfit,
                cogs: current.cogs,
                netProfit: current.netProfit,
                trends,
                monthlySales,
                categoryDistribution,
                topProducts,
                topCustomers
            };
        }
    });
};
