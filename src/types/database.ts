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
                    image_url: string | null
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
                    image_url?: string | null
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
                    image_url?: string | null
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
                    created_at: string
                }
                Insert: {
                    id?: string
                    purchase_id?: string | null
                    product_id?: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    purchase_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    unit_price?: number
                    subtotal?: number
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
                    created_at: string
                }
                Insert: {
                    id?: string
                    sale_id?: string | null
                    product_id?: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    sale_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    unit_price?: number
                    subtotal?: number
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
