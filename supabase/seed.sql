-- Seed contacts
INSERT INTO public.contacts (name, email, company, role) VALUES
('John Doe', 'john@example.com', 'Tech Corp', 'CEO'),
('Jane Smith', 'jane@example.com', 'Design Co', 'Designer'),
('Mike Johnson', 'mike@example.com', 'Dev Inc', 'Developer'),
('Sarah Williams', 'sarah@example.com', 'Marketing Pro', 'Manager');

-- Seed deals (for aggregate stats check)
INSERT INTO public.deals (amount, status, closed_at) VALUES
(5000, 'won', now()),
(12000, 'active', NULL),
(3000, 'won', now()),
(8000, 'active', NULL);

-- Seed chart data
INSERT INTO public.dashboard_chart_data (month, value) VALUES
('Jan', 4000),
('Feb', 3000),
('Mar', 5000),
('Apr', 2780),
('May', 1890),
('Jun', 2390);

-- Seed bar chart data
INSERT INTO public.dashboard_bar_data (quarter, deals_count, revenue) VALUES
('Q1', 42, 145),
('Q2', 38, 132),
('Q3', 55, 187),
('Q4', 47, 166);
