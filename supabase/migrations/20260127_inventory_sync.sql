-- Inventory Management Triggers
-- Automates stock deduction (Sales) and addition (Purchases)

-- 1. Helper Function: Get Product Type
-- We only update stock for 'Product', not 'Service'
CREATE OR REPLACE FUNCTION public.is_physical_product(p_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_type TEXT;
BEGIN
    SELECT type INTO v_type FROM public.products WHERE id = p_id;
    RETURN COALESCE(v_type, 'Product') = 'Product'; -- Default to Product if null
END;
$$ LANGUAGE plpgsql;


-- 2. SALES TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_sales_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- CASE 1: INSERT (New Item Sold)
    IF (TG_OP = 'INSERT') THEN
        IF public.is_physical_product(NEW.product_id) THEN
            UPDATE public.products
            SET current_stock = current_stock - NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    
    -- CASE 2: DELETE (Item Removed/Cancelled)
    ELSIF (TG_OP = 'DELETE') THEN
        IF public.is_physical_product(OLD.product_id) THEN
            UPDATE public.products
            SET current_stock = current_stock + OLD.quantity
            WHERE id = OLD.product_id;
        END IF;
        RETURN OLD;

    -- CASE 3: UPDATE (Quantity Changed)
    ELSIF (TG_OP = 'UPDATE') THEN
        IF public.is_physical_product(NEW.product_id) THEN
            -- Revert old quantity, apply new quantity
            -- Net change = OLD - NEW (if we subtract) => Stock = Stock + OLD - NEW
            -- Example: Was 5, Now 3. Net: +2 back to stock.
            UPDATE public.products
            SET current_stock = current_stock + OLD.quantity - NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. PURCHASE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_purchase_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- CASE 1: INSERT (New Item Purchased)
    IF (TG_OP = 'INSERT') THEN
        IF public.is_physical_product(NEW.product_id) THEN
            UPDATE public.products
            SET current_stock = current_stock + NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    
    -- CASE 2: DELETE (Item Removed/Cancelled)
    ELSIF (TG_OP = 'DELETE') THEN
        IF public.is_physical_product(OLD.product_id) THEN
            UPDATE public.products
            SET current_stock = current_stock - OLD.quantity
            WHERE id = OLD.product_id;
        END IF;
        RETURN OLD;

    -- CASE 3: UPDATE (Quantity Changed)
    ELSIF (TG_OP = 'UPDATE') THEN
        IF public.is_physical_product(NEW.product_id) THEN
            -- Example: Was 10, Now 20. Net: +10 to stock.
            -- Stock = Stock - OLD + NEW
            UPDATE public.products
            SET current_stock = current_stock - OLD.quantity + NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Apply Triggers
DROP TRIGGER IF EXISTS trg_sales_inventory ON public.sales_items;
CREATE TRIGGER trg_sales_inventory
    AFTER INSERT OR UPDATE OR DELETE ON public.sales_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sales_inventory();

DROP TRIGGER IF EXISTS trg_purchase_inventory ON public.purchase_items;
CREATE TRIGGER trg_purchase_inventory
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_purchase_inventory();
