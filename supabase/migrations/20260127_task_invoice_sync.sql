-- Function to automatically create a Sales Invoice when a Task is completed
-- automates: Task Completion -> Sales Invoice

CREATE OR REPLACE FUNCTION public.create_invoice_from_task()
RETURNS TRIGGER AS $$
DECLARE
    v_contact_id UUID;
    v_sale_id UUID;
    v_product_id UUID;
    v_payment_status TEXT;
    v_store_id UUID; -- To ensure contact is created for the right store? Contacts are global currently but typically filtered by RLS.
    -- Wait, contacts are shared or store specific? Schema says 20250102_erp_schema doesn't have store_id on contacts.
    -- Assuming global contacts or RLS handles it.
BEGIN
    -- Only proceed if status changed to 'completed' and not already linked
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.sales_order_id IS NULL THEN
        
        -- 1. Resolve Contact (Customer)
        -- Try to find existing contact by phone
        SELECT id INTO v_contact_id FROM public.contacts WHERE phone = NEW.customer_phone LIMIT 1;
        
        -- If not found, create new contact
        IF v_contact_id IS NULL THEN
            INSERT INTO public.contacts (
                name, 
                phone, 
                address, 
                role
            ) VALUES (
                COALESCE(NEW.customer_name, 'Guest Customer'), 
                COALESCE(NEW.customer_phone, '0000000000'), 
                NEW.customer_address, 
                'Customer'
            ) RETURNING id INTO v_contact_id;
        END IF;

        -- 2. Determine Payment Status
        IF NEW.amount_collected >= NEW.payment_amount AND NEW.payment_amount > 0 THEN
            v_payment_status := 'Paid';
        ELSIF NEW.amount_collected > 0 THEN
            v_payment_status := 'Partial';
        ELSE
            v_payment_status := 'Unpaid';
        END IF;

        -- 3. Create Sales Order
        INSERT INTO public.sales_orders (
            order_no,
            customer_id,
            order_date,
            status,
            total_amount,
            paid_amount,
            payment_status,
            notes
        ) VALUES (
            'TSK-' || substring(NEW.id::text from 1 for 8), -- Generate generic Order No
            v_contact_id,
            CURRENT_DATE,
            'Delivered', -- Auto-completed
            COALESCE(NEW.payment_amount, 0),
            COALESCE(NEW.amount_collected, 0),
            v_payment_status,
            NEW.title
        ) RETURNING id INTO v_sale_id;

        -- 4. Create Sales Item
        -- Use service_id if available, otherwise we need a fallback product?
        -- For now, if service_id is NULL, we might skip item creation or creating a dummy item is risky.
        -- Let's try to use service_id. If NULL, check if title matches a product?
        -- Safer: If service_id is NULL, do NOT create an item row but still create the invoice (header only)?
        -- Or just assign to the first service found? Let's use service_id.
        
        v_product_id := NEW.service_id;
        
        IF v_product_id IS NOT NULL THEN
             INSERT INTO public.sales_items (
                sale_id,
                product_id,
                quantity,
                unit_price,
                subtotal
            ) VALUES (
                v_sale_id,
                v_product_id,
                1,
                COALESCE(NEW.payment_amount, 0),
                COALESCE(NEW.payment_amount, 0)
            );
        END IF;

        -- 5. Record Payment (if collected)
        IF NEW.amount_collected > 0 THEN
            INSERT INTO public.sales_payments (
                sale_id,
                amount,
                payment_date,
                payment_method,
                notes
            ) VALUES (
                v_sale_id,
                NEW.amount_collected,
                CURRENT_DATE,
                COALESCE(CAST(NEW.payment_mode AS TEXT), 'Cash'), -- Cast enum to text
                'Task Collection'
            );
        END IF;

        -- 6. Link back to Task (Prevent loops)
        -- We update the NEW row so it gets saved with the ID. 
        -- Trigger is BEFORE KEY UPDATE? No, usually AFTER.
        -- If AFTER, we need to UPDATE the table again.
        
        UPDATE public.employee_tasks 
        SET sales_order_id = v_sale_id 
        WHERE id = NEW.id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trg_create_invoice_on_task_completion ON public.employee_tasks;
CREATE TRIGGER trg_create_invoice_on_task_completion
    AFTER UPDATE ON public.employee_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.create_invoice_from_task();
