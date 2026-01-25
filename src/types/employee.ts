export type EmployeeRole = 'admin' | 'employee';
export type TaskStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type PaymentMode = 'cash' | 'online' | 'mixed';
export type AttendanceStatus = 'present' | 'late' | 'half_day' | 'absent';

export interface Employee {
    id: string;
    role: EmployeeRole;
    full_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    joining_date: string | null;
    status: 'active' | 'inactive';
    shift_start: string | null;
    store_id: string | null;
    created_at: string;
    updated_at: string;
    store?: { name: string };
}

export interface EmployeeTask {
    id: string;
    employee_id: string | null;
    title: string;
    description: string | null;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    status: TaskStatus;
    payment_status: 'pending' | 'paid' | 'partial';
    payment_amount?: number;
    amount_collected?: number;
    payment_mode?: PaymentMode;
    service_id?: string;
    sales_order_id?: string;
    created_by: string | null;
    created_at: string;
    completed_at: string | null;
    updated_at: string;
}

export interface Attendance {
    id: string;
    employee_id: string | null;
    date: string | null;
    check_in: string | null;
    check_out: string | null;
    status: AttendanceStatus;
    location_check_in: any | null; // JSONB
    notes: string | null;
    created_at: string;
    updated_at: string;
}
