-- Insert default investment plans
INSERT INTO public.investment_plans (name, description, min_amount, max_amount, apy_rate, duration_days) VALUES
('Starter Plan', 'Perfect for beginners looking to start their Bitcoin investment journey', 100.00, 999.99, 12.00, 30),
('Professional Plan', 'Designed for experienced investors seeking balanced returns', 1000.00, 9999.99, 18.00, 60),
('Elite Plan', 'Premium investment option for serious Bitcoin investors', 10000.00, NULL, 25.00, 90)
ON CONFLICT DO NOTHING;

-- Create admin user (you'll need to sign up first, then update this)
-- This is just a placeholder - the actual admin setup will be done after user registration
