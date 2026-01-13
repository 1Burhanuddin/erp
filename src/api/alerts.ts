import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Alert {
    id: string;
    type: 'low_stock' | 'pending_payment' | 'overdue_invoice' | 'expiring_soon';
    severity: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    count?: number;
}

export const useAlerts = () => {
    return useQuery({
        queryKey: ["alerts"],
        queryFn: async (): Promise<Alert[]> => {
            const alerts: Alert[] = [];

            // 1. Low Stock Alerts
            // Fetch all products with alert_quantity set, then filter in JavaScript
            // (Supabase doesn't support comparing columns directly in WHERE clause easily)
            const { data: allProducts } = await supabase
                .from("products")
                .select("id, name, current_stock, alert_quantity")
                .not("alert_quantity", "is", null);

            const lowStockProducts = allProducts?.filter(
                (product) => 
                    product.current_stock !== null && 
                    product.alert_quantity !== null &&
                    product.current_stock < product.alert_quantity
            ) || [];

            if (lowStockProducts && lowStockProducts.length > 0) {
                alerts.push({
                    id: "low_stock",
                    type: "low_stock",
                    severity: "warning",
                    title: "Low Stock Items",
                    message: `${lowStockProducts.length} product(s) are below their alert quantity`,
                    actionUrl: "/inventory",
                    actionLabel: "View Inventory",
                    count: lowStockProducts.length,
                });
            }

            // 2. Pending Payment Alerts (Sales Orders with unpaid amounts)
            const { data: pendingPayments } = await supabase
                .from("sales_orders")
                .select("id, order_no, total_amount, paid_amount, payment_status")
                .neq("payment_status", "Paid")
                .neq("status", "Cancelled");

            if (pendingPayments && pendingPayments.length > 0) {
                const totalPending = pendingPayments.reduce((sum, order) => {
                    const total = Number(order.total_amount) || 0;
                    const paid = Number(order.paid_amount) || 0;
                    return sum + (total - paid);
                }, 0);

                alerts.push({
                    id: "pending_payments",
                    type: "pending_payment",
                    severity: "info",
                    title: "Pending Payments",
                    message: `${pendingPayments.length} order(s) with pending payments (Total: ₹${totalPending.toLocaleString()})`,
                    actionUrl: "/sell/invoice",
                    actionLabel: "View Invoices",
                    count: pendingPayments.length,
                });
            }

            // 3. Overdue Invoices (Sales Orders older than 30 days with pending payments)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

            const { data: overdueInvoices } = await supabase
                .from("sales_orders")
                .select("id, order_no, order_date, total_amount, paid_amount, payment_status")
                .lt("order_date", thirtyDaysAgoStr)
                .neq("payment_status", "Paid")
                .neq("status", "Cancelled");

            if (overdueInvoices && overdueInvoices.length > 0) {
                const totalOverdue = overdueInvoices.reduce((sum, order) => {
                    const total = Number(order.total_amount) || 0;
                    const paid = Number(order.paid_amount) || 0;
                    return sum + (total - paid);
                }, 0);

                alerts.push({
                    id: "overdue_invoices",
                    type: "overdue_invoice",
                    severity: "error",
                    title: "Overdue Invoices",
                    message: `${overdueInvoices.length} invoice(s) overdue by more than 30 days (Total: ₹${totalOverdue.toLocaleString()})`,
                    actionUrl: "/sell/invoice",
                    actionLabel: "View Invoices",
                    count: overdueInvoices.length,
                });
            }

            // 4. Recent Activity Summary (optional - could show recent deals, sales, etc.)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

            const { count: recentDeals } = await supabase
                .from("deals")
                .select("*", { count: "exact", head: true })
                .gte("created_at", sevenDaysAgoStr)
                .in("status", ["New", "Contacted", "Negotiation"]);

            if (recentDeals && recentDeals > 0) {
                alerts.push({
                    id: "recent_deals",
                    type: "expiring_soon",
                    severity: "info",
                    title: "Active Deals",
                    message: `${recentDeals} active deal(s) in the pipeline`,
                    actionUrl: "/deals",
                    actionLabel: "View Deals",
                    count: recentDeals,
                });
            }

            return alerts;
        },
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    });
};
