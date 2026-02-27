# ERP System

A comprehensive enterprise resource planning system with integrated features for managing sales, purchases, inventory, and customer relationships.

## Features

- **Direct Sales & Purchases**: Streamlined order processing with AI-powered prefilling
- **Inventory Management**: Track products and stock levels
- **Customer & Supplier Management**: Maintain contact information and relationships
- **Audit Logging**: Track all system changes for compliance
- **Multi-store Support**: Manage multiple store locations
- **AI Integration**: Smart order scanning and data entry assistance
- **Reports**: GST, Profit & Loss, Stock, and Expense reports

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: shadcn-ui
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Supabase with PostgreSQL
- **AI**: Google Gemini integration

## Getting Started

### Prerequisites
- Node.js & npm (or Bun)
- Git

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

## Debugging

Utility scripts are available in the `scripts/` directory to help with debugging database issues.

### debug_sales_items.cjs
Checks if the `sales_items` table has the necessary tax columns populated.
```sh
node scripts/debug_sales_items.cjs
```

