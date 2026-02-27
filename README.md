# Operra - ERP System

**Operra** is a comprehensive Enterprise Resource Planning (ERP) system designed for small to medium businesses. Manage all aspects of your business operations—from inventory and procurement to sales, customer relationships, employee management, and advanced financial reporting—all in one unified platform.

## Key Features

### 📊 Sales & Invoicing
- **Quotations**: Create and manage sales quotes
- **Sales Orders**: Track and process customer orders
- **Delivery Challans**: Manage delivery documentation
- **Sales Invoices**: Generate and track invoices
- **Direct Sales**: Quick sales entry for walk-in customers
- **Sale Returns**: Process customer returns and adjustments
- **E-Commerce Sales**: Integrate with online store orders
- **Web Bookings**: Manage service requests and appointments

### 🛍️ Purchasing & Procurement
- **Purchase Orders**: Create and manage supplier orders
- **Goods Receipt Notes (GRN)**: Track incoming goods
- **Purchase Invoices**: Record supplier bills
- **Direct Purchase**: Quick procurement entry
- **Purchase Returns**: Process supplier returns

### 📦 Inventory Management
- **Real-time Stock Tracking**: Monitor inventory levels across locations
- **Product Master**: Manage products with categories, brands, and units
- **Stock Adjustments**: Manual inventory corrections
- **Multi-warehouse Support**: Organize inventory by location
- **Stock Valuation Reports**: Track inventory value and metrics

### 👥 Contacts & CRM
- **Supplier Management**: Maintain supplier details and purchase history
- **Customer Management**: Track customer information and interactions
- **Deals Pipeline**: Manage sales opportunities with Kanban board
- **Contact Classification**: Organize contacts by role and category

### 👨‍💼 Employee & HR Management
- **Employee Directory**: Manage employee information and profiles
- **Attendance Tracking**: Record attendance with geofencing support
- **Task Management**: Assign and track employee tasks
- **Performance Monitoring**: Track employee performance metrics
- **Mobile App**: Dedicated mobile interface for field employees

### 📈 Advanced Reporting & Analytics
- **Profit & Loss (P&L)**: Financial health analysis with date range filtering
- **GST Compliance**: GSTR-1 and GSTR-3B tax reports for Indian businesses
- **Stock Valuation**: Detailed inventory analytics and alerts
- **Expense Breakdown**: Track and analyze operational costs
- **General Reports**: Sales trends, monthly revenue, category distribution
- **Export Options**: Download reports as CSV for further analysis

### 🔐 Security & Compliance
- **Row Level Security (RLS)**: Complete data isolation between users via Supabase
- **Audit Logging**: Track all system changes with user attribution
- **Multi-Store Support**: Manage multiple business locations independently
- **Role-Based Access**: Admin and Employee role separation

### 🤖 AI-Powered Features
- **Smart Order Scanning**: Google Gemini integration for automated order entry
- **AI Prefilling**: Intelligent data prefilling to reduce manual entry
- **Document Analysis**: Extract data from order images

## Module Structure

```
Sales & Invoicing     → Quotations, Orders, Invoices, Returns, E-Commerce
├─ Direct Sales      → Quick transaction entry
├─ Web Bookings      → Service requests
└─ Delivery Tracking → Challan management

Purchasing           → POs, GRNs, Invoices, Returns
└─ Direct Purchase   → Quick procurement

Inventory            → Stock levels, Adjustments, Valuation reports
└─ Product Master    → Categories, Brands, Units

Contacts             → Suppliers, Customers, Deals
└─ CRM Pipeline      → Sales opportunity tracking

HR & Employees       → Directory, Attendance, Tasks, Performance
└─ Mobile App        → Field operations interface

Reports & Analytics  → P&L, GST, Stock, Expenses, General insights
└─ Export Tools      → CSV/Excel downloads

Settings             → Business details, User profiles, Configuration
└─ Audit Logs        → Complete change history
```

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Components**: shadcn-ui with Radix primitives
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Prerequisites
- Node.js 16+ & npm (or Bun)
- Git
- Supabase account (for backend)

### Installation

```sh
# Clone the repository
git clone https://github.com/1Burhanuddin/erp.git

# Navigate to project directory
cd erp

# Install dependencies
npm install
# or with bun
bun install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Configuration

Create a `.env.local` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Project Structure

```
src/
├── api/               # Supabase hooks and API calls
├── components/        # Reusable UI components
│   ├── layout/       # Layout components
│   ├── ui/           # Basic UI components
│   └── ai/           # AI-powered components
├── pages/            # Route-based page components
│   ├── sales/        # Sales module
│   ├── purchase/     # Purchase module
│   ├── employees/    # HR & Employee module
│   ├── reports/      # Reporting module
│   ├── expenses/     # Expense tracking
│   ├── mobile/       # Mobile app interface
│   └── settings/     # Configuration pages
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── config/           # Application configuration
```

## Build & Deploy

```sh
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The application is designed for deployment on platforms like Vercel, Netlify, or your own server.

