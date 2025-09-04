-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create portfolio
  INSERT INTO public.portfolios (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update portfolio totals
CREATE OR REPLACE FUNCTION public.update_portfolio_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update portfolio totals when transactions change
  UPDATE public.portfolios 
  SET 
    balance = COALESCE((
      SELECT SUM(CASE 
        WHEN type IN ('deposit', 'admin_credit', 'profit') THEN amount
        WHEN type IN ('withdrawal', 'investment') THEN -amount
        ELSE 0
      END)
      FROM public.transactions 
      WHERE user_id = NEW.user_id AND status = 'completed'
    ), 0),
    total_invested = COALESCE((
      SELECT SUM(amount)
      FROM public.investments 
      WHERE user_id = NEW.user_id
    ), 0),
    total_profit = COALESCE((
      SELECT SUM(amount)
      FROM public.transactions 
      WHERE user_id = NEW.user_id AND type = 'profit' AND status = 'completed'
    ), 0),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger for transaction updates
CREATE TRIGGER update_portfolio_on_transaction
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_totals();
