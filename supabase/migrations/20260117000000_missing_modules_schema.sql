-- Create purchase_returns table
CREATE TABLE public.purchase_returns (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id uuid REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    return_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    reason text NOT NULL,
    total_refund_amount numeric DEFAULT 0,
    status text DEFAULT 'Completed',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create purchase_return_items table
CREATE TABLE public.purchase_return_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    return_id uuid REFERENCES public.purchase_returns(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity integer NOT NULL,
    refund_amount numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add channel column to sales_orders
ALTER TABLE public.sales_orders 
ADD COLUMN channel text DEFAULT 'Direct';

-- Enable RLS
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_return_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.purchase_returns FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.purchase_returns FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.purchase_returns FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.purchase_returns FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON public.purchase_return_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.purchase_return_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.purchase_return_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.purchase_return_items FOR DELETE USING (true);
