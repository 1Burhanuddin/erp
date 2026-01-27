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
import AddUnit from "./pages/products/AddUnit";
import EditUnit from "./pages/products/EditUnit";
import Categories from "./pages/products/Categories";
import AddCategory from "./pages/products/AddCategory";
import EditCategory from "./pages/products/EditCategory";
import SubCategories from "./pages/products/SubCategories";
import AddSubCategory from "./pages/products/AddSubCategory";
import EditSubCategory from "./pages/products/EditSubCategory";
import Brands from "./pages/products/Brands";
import AddBrand from "./pages/products/AddBrand";
import EditBrand from "./pages/products/EditBrand";
import PurchaseOrder from "./pages/purchase/PurchaseOrder";
import AddPurchaseOrder from "./pages/purchase/AddPurchaseOrder";
import EditPurchaseOrder from "./pages/purchase/EditPurchaseOrder";
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
import Bookings from "./pages/sell/Bookings";
import StockAdjustment from "./pages/stock/StockAdjustment";
import AddStockAdjustment from "./pages/stock/AddStockAdjustment";
import EditStockAdjustment from "./pages/stock/EditStockAdjustment";
import ExpensesList from "./pages/expenses/ExpensesList";
import AddExpense from "./pages/expenses/AddExpense";
import EditExpense from "./pages/expenses/EditExpense";
import ExpenseCategories from "./pages/expenses/ExpenseCategories";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminRoute } from "./components/RoleRoutes";
import { AuthProvider } from "./hooks/useAuth";

// Employee Management
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeDetails from "./pages/employees/EmployeeDetails";
import AddEmployee from "./pages/employees/AddEmployee";
import EditEmployee from "./pages/employees/EditEmployee";
import EmployeeTasks from "./pages/employees/EmployeeTasks";
import AddTask from "./pages/employees/tasks/AddTask";
import EditTask from "./pages/employees/tasks/EditTask";
import Attendance from "./pages/employees/Attendance";
import LiveStatus from "./pages/employees/LiveStatus";
import EmployeePerformance from "./pages/employees/EmployeePerformance";
import FixStores from "./pages/debug/FixStores";
import EmployeeDashboard from "./pages/mobile/EmployeeDashboard";
import MyTasks from "./pages/mobile/MyTasks";
import MyAttendance from "./pages/mobile/MyAttendance";
import EmployeeProfile from "./pages/mobile/EmployeeProfile";
// Settings Pages
import UserProfile from "./pages/settings/UserProfile";
import ChangePassword from "./pages/settings/ChangePassword";
import ChangeEmail from "./pages/settings/ChangeEmail";
import BusinessDetails from "./pages/settings/BusinessDetails";
import StoresSettings from "./pages/settings/StoresSettings";
import AddStore from "./pages/settings/AddStore";
import EditStore from "./pages/settings/EditStore";
import TaxAndBank from "./pages/settings/TaxAndBank";
import OwnerDetails from "./pages/settings/OwnerDetails";
import AppSettings from "./pages/settings/AppSettings";
import DebugAuth from "./pages/debug/DebugAuth";
import SetupWizard from "./pages/onboarding/SetupWizard";
import DemoDashboard from "./pages/DemoDashboard";
import DemoCards from "./pages/DemoCards";

import ShopLayout from "./pages/demo-shop/ShopLayout";
import LandingPage from "./pages/demo-shop/LandingPage";
import ProductPage from "./pages/demo-shop/ProductPage";
import CheckoutPage from "./pages/demo-shop/CheckoutPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />

              {/* Shop Demo Routes - Public */}
              <Route path="/shop-preview" element={<ShopLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="product/:id" element={<ProductPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
              </Route>

              {/* Admin Routes - Protected & Restricted to 'admin' role */}
              <Route element={<AdminRoute />}>
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
                  <Route path="/products/units/add" element={<AddUnit />} />
                  <Route path="/products/units/edit/:id" element={<EditUnit />} />
                  <Route path="/products/categories" element={<Categories />} />
                  <Route path="/products/categories/add" element={<AddCategory />} />
                  <Route path="/products/categories/edit/:id" element={<EditCategory />} />
                  <Route path="/products/sub-categories" element={<SubCategories />} />
                  <Route path="/products/sub-categories/add" element={<AddSubCategory />} />
                  <Route path="/products/sub-categories/edit/:id" element={<EditSubCategory />} />
                  <Route path="/products/brands" element={<Brands />} />
                  <Route path="/products/brands/add" element={<AddBrand />} />
                  <Route path="/products/brands/edit/:id" element={<EditBrand />} />

                  <Route path="/services" element={<ServicesList />} />
                  <Route path="/services/add" element={<AddProduct />} />
                  <Route path="/services/edit/:id" element={<EditProduct />} />

                  <Route path="/purchase/order" element={<PurchaseOrder />} />
                  <Route path="/purchase/add" element={<AddPurchaseOrder />} />
                  <Route path="/purchase/edit/:id" element={<EditPurchaseOrder />} />
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
                  <Route path="/sell/bookings" element={<Bookings />} />

                  <Route path="/stock/adjustment" element={<StockAdjustment />} />
                  <Route path="/stock/adjustment/add" element={<AddStockAdjustment />} />
                  <Route path="/stock/adjustment/:id" element={<EditStockAdjustment />} />

                  <Route path="/expenses/list" element={<ExpensesList />} />
                  <Route path="/expenses/add" element={<AddExpense />} />
                  <Route path="/expenses/edit/:id" element={<EditExpense />} />
                  <Route path="/expenses/categories" element={<ExpenseCategories />} />

                  <Route path="/deals" element={<Deals />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/audit-logs/:id" element={<AuditLogDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/profile" element={<UserProfile />} />
                  <Route path="/settings/password" element={<ChangePassword />} />
                  <Route path="/settings/email" element={<ChangeEmail />} />
                  <Route path="/settings/business" element={<BusinessDetails />} />
                  <Route path="/settings/stores" element={<StoresSettings />} />
                  <Route path="/settings/stores/add" element={<AddStore />} />
                  <Route path="/settings/stores/edit/:id" element={<EditStore />} />
                  <Route path="/settings/tax-bank" element={<TaxAndBank />} />
                  <Route path="/settings/owner" element={<OwnerDetails />} />
                  <Route path="/settings/app" element={<AppSettings />} />

                  {/* Employee Management System */}
                  <Route path="/employees/list" element={<EmployeeList />} />
                  <Route path="/employees/details/:id" element={<EmployeeDetails />} />
                  <Route path="/employees/add" element={<AddEmployee />} />
                  <Route path="/employees/edit/:id" element={<EditEmployee />} />
                  <Route path="/employees/tasks" element={<EmployeeTasks />} />
                  <Route path="/employees/tasks/add" element={<AddTask />} />
                  <Route path="/employees/tasks/edit/:id" element={<EditTask />} />
                  <Route path="/employees/live" element={<LiveStatus />} />
                  <Route path="/employees/performance" element={<EmployeePerformance />} />
                  <Route path="/employees/attendance" element={<Attendance />} />
                  <Route path="/demo-cards" element={<DemoCards />} />

                </Route>
              </Route>

              {/* Employee App Routes - Protected (Any Authenticated User) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/setup" element={<SetupWizard />} />
                <Route path="/mobile/dashboard" element={<EmployeeDashboard />} />
                <Route path="/mobile/tasks" element={<MyTasks />} />
                <Route path="/mobile/attendance" element={<MyAttendance />} />
                <Route path="/mobile/profile" element={<EmployeeProfile />} />
                <Route path="/debug/auth" element={<DebugAuth />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;