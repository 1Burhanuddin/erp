-- RPC to get employee performance metrics
CREATE OR REPLACE FUNCTION public.get_employee_performance(
    p_start_date DATE,
    p_end_date DATE,
    p_store_id UUID DEFAULT NULL
)
RETURNS TABLE (
    employee_id UUID,
    full_name TEXT,
    tasks_assigned BIGINT,
    tasks_completed BIGINT,
    tasks_completion_rate NUMERIC,
    revenue_collected NUMERIC,
    attendance_days BIGINT,
    avg_working_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.full_name,
        -- Count Tasks Assigned
        COUNT(t.id) FILTER (WHERE t.created_at::DATE BETWEEN p_start_date AND p_end_date) as tasks_assigned,
        -- Count Tasks Completed
        COUNT(t.id) FILTER (WHERE t.status = 'completed' AND t.completed_at::DATE BETWEEN p_start_date AND p_end_date) as tasks_completed,
        -- Completion Rate
        CASE 
            WHEN COUNT(t.id) FILTER (WHERE t.created_at::DATE BETWEEN p_start_date AND p_end_date) = 0 THEN 0
            ELSE ROUND((COUNT(t.id) FILTER (WHERE t.status = 'completed')::NUMERIC / COUNT(t.id)::NUMERIC) * 100, 2)
        END as tasks_completion_rate,
        -- Revenue
        COALESCE(SUM(t.amount_collected) FILTER (WHERE t.status = 'completed' AND t.completed_at::DATE BETWEEN p_start_date AND p_end_date), 0) as revenue_collected,
        -- Attendance Days
        (
            SELECT COUNT(*) 
            FROM public.attendance a 
            WHERE a.employee_id = e.id 
            AND a.date BETWEEN p_start_date AND p_end_date
            AND a.status IN ('present', 'late', 'half_day')
        ) as attendance_days,
        -- Avg Hours (Mock calculation for now as check_out might be null)
        COALESCE((
            SELECT AVG(EXTRACT(EPOCH FROM (a.check_out - a.check_in))/3600)::NUMERIC(10,2)
            FROM public.attendance a 
            WHERE a.employee_id = e.id 
            AND a.date BETWEEN p_start_date AND p_end_date
            AND a.check_out IS NOT NULL
        ), 0) as avg_working_hours
    FROM 
        public.employees e
    LEFT JOIN 
        public.employee_tasks t ON e.id = t.employee_id
    WHERE 
        (p_store_id IS NULL OR e.store_id = p_store_id)
        AND e.role = 'employee'
    GROUP BY 
        e.id, e.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
