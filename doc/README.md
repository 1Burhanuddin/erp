# ERP System Documentation

## Project Overview
This represents a comprehensive Enterprise Resource Planning (ERP) system designed for small to medium businesses. The application facilitates core business operations including Contact Management (CRM), Inventory and Product Management, Purchasing, Sales, Stock Control, and Expense Tracking.

The system is built on a Multi-tenant architecture using Supabase Row Level Security (RLS) to strictly enforce data isolation between users.

## Technology Stack
-   **Frontend**: React 18 (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: Shadcn UI (Radix Primitives)
-   **State Management**: React Query (Tanstack Query)
-   **Routing**: React Router DOM v6
-   **Backend / Database**: Supabase (PostgreSQL + Auth)
-   **Icons**: Lucide React

## Setup and Installation

1.  **Prerequisites**: Node.js (v18+) and npm.
2.  **Environment Variables**: Create a `.env` file in the root directory with the following keys:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Project Structure
-   `src/api`: API hooks and Supabase interaction logic.
-   `src/components`: Reusable UI components.
-   `src/components/layout`: Layout wrappers (Sidebar, DashboardLayout).
-   `src/pages`: Main application pages (routes).
-   `src/lib`: Utilities and Supabase client configuration.
-   `supabase/migrations`: SQL migration files for database schema.
