import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import ContactDetails from "./pages/ContactDetails";
import Deals from "./pages/Deals";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import AuditLogDetails from "./pages/AuditLogDetails";
import Settings from "./pages/Settings";
import Suppliers from "./pages/contacts/Suppliers";
import Customers from "./pages/contacts/Customers";
import EcommerceCustomers from "./pages/contacts/EcommerceCustomers";
import ImportContacts from "./pages/contacts/ImportContacts";
import AddContact from "./pages/contacts/AddContact";
import EditContact from "./pages/contacts/EditContact";
import ProductsList from "./pages/products/ProductsList";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import ImportProducts from "./pages/products/ImportProducts";
import ServicesList from "./pages/products/ServicesList";
import Units from "./pages/products/Units";
import Categories from "./pages/products/Categories";
import SubCategories from "./pages/products/SubCategories";
import Brands from "./pages/products/Brands";
import PurchaseOrder from "./pages/purchase/PurchaseOrder";
import AddPurchaseOrder from "./pages/purchase/AddPurchaseOrder";
import GRN from "./pages/purchase/GRN";
import PurchaseInvoice from "./pages/purchase/PurchaseInvoice";
import PurchaseInvoiceDetails from "./pages/purchase/PurchaseInvoiceDetails";
import DirectPurchase from "./pages/purchase/DirectPurchase";
import PurchaseReturn from "./pages/purchase/PurchaseReturn";
import AddPurchaseReturn from "./pages/purchase/AddPurchaseReturn";
import Quotations from "./pages/sales/Quotations";
import AddQuotation from "./pages/sales/AddQuotation";
import EditQuotation from "./pages/sales/EditQuotation";
import SalesOrder from "./pages/sell/SalesOrder";
import AddSalesOrder from "./pages/sell/AddSalesOrder";
import DeliveryChallans from "./pages/sales/DeliveryChallans";
import AddDeliveryChallan from "./pages/sales/AddDeliveryChallan";
import EditDeliveryChallan from "./pages/sales/EditDeliveryChallan";
import SalesInvoice from "./pages/sell/SalesInvoice";
import AddSalesInvoice from "./pages/sell/AddSalesInvoice";
import SalesInvoiceDetails from "./pages/sell/SalesInvoiceDetails";
import DirectSale from "./pages/sell/DirectSale";
import SaleReturn from "./pages/sell/SaleReturn";
import AddSaleReturn from "./pages/sell/AddSaleReturn";
import EditSaleReturn from "./pages/sell/EditSaleReturn";
import EcommerceSale from "./pages/sell/EcommerceSale";
import StockAdjustment from "./pages/stock/StockAdjustment";
import AddStockAdjustment from "./pages/stock/AddStockAdjustment";
import EditStockAdjustment from "./pages/stock/EditStockAdjustment";
import ExpensesList from "./pages/expenses/ExpensesList";
import AddExpense from "./pages/expenses/AddExpense";
import EditExpense from "./pages/expenses/EditExpense";
import ExpenseCategories from "./pages/expenses/ExpenseCategories";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/contacts/suppliers" element={<Suppliers />} />
                <Route path="/contacts/suppliers/add" element={<AddContact />} />
                <Route path="/contacts/customers" element={<Customers />} />
                <Route path="/contacts/customers/add" element={<AddContact />} />
                <Route path="/contacts/ecommerce" element={<EcommerceCustomers />} />
                <Route path="/contacts/import" element={<ImportContacts />} />
                <Route path="/contacts/:id" element={<ContactDetails />} />
                <Route path="/contacts/edit/:id" element={<EditContact />} />

                <Route path="/products/list" element={<ProductsList />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/products/edit/:id" element={<EditProduct />} />
                <Route path="/products/import" element={<ImportProducts />} />
                <Route path="/products/units" element={<Units />} />
                <Route path="/products/categories" element={<Categories />} />
                <Route path="/products/sub-categories" element={<SubCategories />} />
                <Route path="/products/brands" element={<Brands />} />

                <Route path="/services" element={<ServicesList />} />
                <Route path="/services/add" element={<AddProduct />} />
                <Route path="/services/edit/:id" element={<EditProduct />} />

                <Route path="/purchase/order" element={<PurchaseOrder />} />
                <Route path="/purchase/add" element={<AddPurchaseOrder />} />
                <Route path="/purchase/grn" element={<GRN />} />
                <Route path="/purchase/invoice" element={<PurchaseInvoice />} />
                <Route path="/purchase/invoice/:id" element={<PurchaseInvoiceDetails />} />
                <Route path="/purchase/direct" element={<DirectPurchase />} />
                <Route path="/purchase/return" element={<PurchaseReturn />} />
                <Route path="/purchase/return/add" element={<AddPurchaseReturn />} />

                <Route path="/sales/quotations" element={<Quotations />} />
                <Route path="/sales/quotations/add" element={<AddQuotation />} />
                <Route path="/sales/quotations/edit/:id" element={<EditQuotation />} />
                <Route path="/sell/order" element={<SalesOrder />} />
                <Route path="/sell/order/add" element={<AddSalesOrder />} />
                <Route path="/sales/challans" element={<DeliveryChallans />} />
                <Route path="/sales/challans/add" element={<AddDeliveryChallan />} />
                <Route path="/sales/challans/edit/:id" element={<EditDeliveryChallan />} />
                <Route path="/sell/invoice" element={<SalesInvoice />} />
                <Route path="/sell/invoice/:id" element={<SalesInvoiceDetails />} />
                <Route path="/sell/add" element={<AddSalesInvoice />} />
                <Route path="/sell/direct" element={<DirectSale />} />
                <Route path="/sell/return" element={<SaleReturn />} />
                <Route path="/sell/return/add" element={<AddSaleReturn />} />
                <Route path="/sell/return/:id" element={<EditSaleReturn />} />
                <Route path="/sell/ecommerce" element={<EcommerceSale />} />

                <Route path="/stock/adjustment" element={<StockAdjustment />} />
                <Route path="/stock/adjustment/add" element={<AddStockAdjustment />} />
                <Route path="/stock/adjustment/:id" element={<EditStockAdjustment />} />

                <Route path="/expenses/list" element={<ExpensesList />} />
                <Route path="/expenses/add" element={<AddExpense />} />
                <Route path="/expenses/edit/:id" element={<EditExpense />} />
                <Route path="/expenses/categories" element={<ExpenseCategories />} />

                <Route path="/deals" element={<Deals />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/audit-logs/:id" element={<AuditLogDetails />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;