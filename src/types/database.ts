export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            contacts: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    phone: string | null
                    company: string | null
                    role: string | null
                    address: string | null
                    state: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    company?: string | null
                    role?: string | null
                    address?: string | null
                    state?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    phone?: string | null
                    company?: string | null
                    role?: string | null
                    address?: string | null
                    state?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            product_categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            product_sub_categories: {
                Row: {
                    id: string
                    name: string
                    category_id: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category_id: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category_id?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            product_brands: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            product_units: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    sku: string | null
                    category_id: string | null
                    sub_category_id: string | null
                    brand_id: string | null
                    unit_id: string | null
                    purchase_price: number | null
                    sale_price: number | null
                    current_stock: number | null
                    alert_quantity: number | null
                    description: string | null
                    hsn_code: string | null
                    is_tax_inclusive: boolean
                    image_url: string | null
                    // Ecommerce fields
                    is_online: boolean
                    images: Json | null
                    features: Json | null
                    online_price: number | null
                    condition: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    sku?: string | null
                    category_id?: string | null
                    sub_category_id?: string | null
                    brand_id?: string | null
                    unit_id?: string | null
                    purchase_price?: number | null
                    sale_price?: number | null
                    current_stock?: number | null
                    alert_quantity?: number | null
                    description?: string | null
                    hsn_code?: string | null
                    is_tax_inclusive?: boolean
                    image_url?: string | null
                    // Ecommerce fields
                    is_online?: boolean
                    images?: Json | null
                    features?: Json | null
                    online_price?: number | null
                    condition?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    sku?: string | null
                    category_id?: string | null
                    sub_category_id?: string | null
                    brand_id?: string | null
                    unit_id?: string | null
                    purchase_price?: number | null
                    sale_price?: number | null
                    current_stock?: number | null
                    alert_quantity?: number | null
                    description?: string | null
                    hsn_code?: string | null
                    is_tax_inclusive?: boolean
                    image_url?: string | null
                    // Ecommerce fields
                    is_online?: boolean
                    images?: Json | null
                    features?: Json | null
                    online_price?: number | null
                    condition?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            expense_categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    reference_no: string | null
                    category_id: string | null
                    amount: number
                    expense_date: string | null
                    description: string | null
                    payment_method: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    reference_no?: string | null
                    category_id?: string | null
                    amount: number
                    expense_date?: string | null
                    description?: string | null
                    payment_method?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    reference_no?: string | null
                    category_id?: string | null
                    amount?: number
                    expense_date?: string | null
                    description?: string | null
                    payment_method?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            purchase_orders: {
                Row: {
                    id: string
                    order_no: string
                    supplier_id: string | null
                    order_date: string | null
                    status: string | null
                    total_amount: number | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_no: string
                    supplier_id?: string | null
                    order_date?: string | null
                    status?: string | null
                    total_amount?: number | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_no?: string
                    supplier_id?: string | null
                    order_date?: string | null
                    status?: string | null
                    total_amount?: number | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            purchase_items: {
                Row: {
                    id: string
                    purchase_id: string | null
                    product_id: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    tax_rate_id: string | null
                    tax_amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    purchase_id?: string | null
                    product_id?: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    tax_rate_id?: string | null
                    tax_amount?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    purchase_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    unit_price?: number
                    subtotal?: number
                    tax_rate_id?: string | null
                    tax_amount?: number
                    created_at?: string
                }
            }
            sales_orders: {
                Row: {
                    id: string
                    order_no: string
                    customer_id: string | null
                    order_date: string | null
                    status: string | null
                    total_amount: number | null
                    payment_status: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_no: string
                    customer_id?: string | null
                    order_date?: string | null
                    status?: string | null
                    total_amount?: number | null
                    payment_status?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_no?: string
                    customer_id?: string | null
                    order_date?: string | null
                    status?: string | null
                    total_amount?: number | null
                    payment_status?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            sales_items: {
                Row: {
                    id: string
                    sale_id: string | null
                    product_id: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    tax_rate_id: string | null
                    tax_amount: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    sale_id?: string | null
                    product_id?: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    tax_rate_id?: string | null
                    tax_amount?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    sale_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    unit_price?: number
                    subtotal?: number
                    tax_rate_id?: string | null
                    tax_amount?: number
                    created_at?: string
                }
            }
            sales_payments: {
                Row: {
                    id: string
                    sale_id: string
                    amount: number
                    payment_date: string | null
                    payment_method: string | null
                    reference: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    sale_id: string
                    amount: number
                    payment_date?: string | null
                    payment_method?: string | null
                    reference?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    sale_id?: string
                    amount?: number
                    payment_date?: string | null
                    payment_method?: string | null
                    reference?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            stock_adjustments: {
                Row: {
                    id: string
                    reference_no: string
                    adjustment_date: string
                    reason: string
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    reference_no: string
                    adjustment_date: string
                    reason: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    reference_no?: string
                    adjustment_date?: string
                    reason?: string
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            stock_adjustment_items: {
                Row: {
                    id: string
                    adjustment_id: string
                    product_id: string
                    quantity: number
                    type: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    adjustment_id: string
                    product_id: string
                    quantity: number
                    type: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    adjustment_id?: string
                    product_id?: string
                    quantity?: number
                    type?: string
                    created_at?: string
                }
            }
            business_profiles: {
                Row: {
                    id: string
                    company_name: string
                    company_type: string | null
                    address: string | null
                    state: string | null
                    phone: string | null
                    email: string | null
                    website: string | null
                    logo_url: string | null
                    signature_url: string | null
                    gstin: string | null
                    pan_no: string | null
                    tax_scheme: string | null
                    owner_name: string | null
                    owner_phone: string | null
                    owner_email: string | null
                    bank_name: string | null
                    account_no: string | null
                    ifsc_code: string | null
                    branch_name: string | null
                    timezone: string | null
                    currency: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_name: string
                    company_type?: string | null
                    address?: string | null
                    state?: string | null
                    phone?: string | null
                    email?: string | null
                    website?: string | null
                    logo_url?: string | null
                    signature_url?: string | null
                    gstin?: string | null
                    pan_no?: string | null
                    tax_scheme?: string | null
                    owner_name?: string | null
                    owner_phone?: string | null
                    owner_email?: string | null
                    bank_name?: string | null
                    account_no?: string | null
                    ifsc_code?: string | null
                    branch_name?: string | null
                    timezone?: string | null
                    currency?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    company_name?: string
                    company_type?: string | null
                    address?: string | null
                    state?: string | null
                    phone?: string | null
                    email?: string | null
                    website?: string | null
                    logo_url?: string | null
                    signature_url?: string | null
                    gstin?: string | null
                    pan_no?: string | null
                    tax_scheme?: string | null
                    owner_name?: string | null
                    owner_phone?: string | null
                    owner_email?: string | null
                    bank_name?: string | null
                    account_no?: string | null
                    ifsc_code?: string | null
                    branch_name?: string | null
                    timezone?: string | null
                    currency?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            tax_rates: {
                Row: {
                    id: string
                    store_id: string | null
                    user_id: string | null
                    name: string
                    percentage: number
                    description: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id?: string | null
                    user_id?: string | null
                    name: string
                    percentage: number
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string | null
                    user_id?: string | null
                    name?: string
                    percentage?: number
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            packages: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    features: Json | null
                    is_active: boolean
                    display_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price?: number
                    features?: Json | null
                    is_active?: boolean
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    features?: Json | null
                    is_active?: boolean
                    display_order?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            bookings: {
                Row: {
                    id: string
                    customer_name: string
                    customer_phone: string
                    customer_email: string | null
                    service_type: string
                    package_id: string | null
                    status: string
                    preferred_date: string | null
                    preferred_time: string | null
                    address: string | null
                    notes: string | null
                    user_id: string | null
                    store_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    customer_name: string
                    customer_phone: string
                    customer_email?: string | null
                    service_type: string
                    package_id?: string | null
                    status?: string
                    preferred_date?: string | null
                    preferred_time?: string | null
                    address?: string | null
                    notes?: string | null
                    user_id?: string | null
                    store_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    customer_name?: string
                    customer_phone?: string
                    customer_email?: string | null
                    service_type?: string
                    package_id?: string | null
                    status?: string
                    preferred_date?: string | null
                    preferred_time?: string | null
                    address?: string | null
                    notes?: string | null
                    user_id?: string | null
                    store_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    table_name: string
                    record_id: string
                    action: string
                    old_data: Json | null
                    new_data: Json | null
                    changed_fields: string[] | null
                    ip_address: string | null
                    user_agent: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    table_name: string
                    record_id: string
                    action: string
                    old_data?: Json | null
                    new_data?: Json | null
                    changed_fields?: string[] | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    table_name?: string
                    record_id?: string
                    action?: string
                    old_data?: Json | null
                    new_data?: Json | null
                    changed_fields?: string[] | null
                    ip_address?: string | null
                    user_agent?: string | null
                    created_at?: string
                }
            }
            stores: {
                Row: {
                    id: string
                    name: string
                    domain: string | null
                    description: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    domain?: string | null
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    domain?: string | null
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            store_products: {
                Row: {
                    id: string
                    store_id: string
                    product_id: string
                    is_active: boolean
                    custom_price: number | null
                    custom_stock: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    product_id: string
                    is_active?: boolean
                    custom_price?: number | null
                    custom_stock?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    product_id?: string
                    is_active?: boolean
                    custom_price?: number | null
                    custom_stock?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
