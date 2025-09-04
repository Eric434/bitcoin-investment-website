-- Create crypto deposits table to track cryptocurrency deposits
CREATE TABLE IF NOT EXISTS crypto_deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cryptocurrency VARCHAR(10) NOT NULL, -- BTC, ETH, USDT, etc.
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  amount_crypto DECIMAL(20, 8) NOT NULL, -- Amount in cryptocurrency
  amount_usd DECIMAL(15, 2) NOT NULL, -- USD equivalent
  exchange_rate DECIMAL(15, 2) NOT NULL, -- Exchange rate at time of deposit
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'failed')),
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 3,
  network VARCHAR(50) NOT NULL, -- Bitcoin Network, Ethereum Network, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_user_id ON crypto_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_status ON crypto_deposits(status);
CREATE INDEX IF NOT EXISTS idx_crypto_deposits_transaction_hash ON crypto_deposits(transaction_hash);

-- Enable RLS
ALTER TABLE crypto_deposits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own crypto deposits" ON crypto_deposits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crypto deposits" ON crypto_deposits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policy to view all deposits
CREATE POLICY "Admins can view all crypto deposits" ON crypto_deposits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create function to automatically update portfolio balance when crypto deposit is completed
CREATE OR REPLACE FUNCTION handle_crypto_deposit_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update portfolio balance
    INSERT INTO portfolios (user_id, balance, updated_at)
    VALUES (NEW.user_id, NEW.amount_usd, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      balance = portfolios.balance + NEW.amount_usd,
      updated_at = NOW();
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id, 
      type, 
      amount, 
      status, 
      description,
      reference_id
    ) VALUES (
      NEW.user_id,
      'deposit',
      NEW.amount_usd,
      'completed',
      'Cryptocurrency deposit: ' || NEW.amount_crypto || ' ' || NEW.cryptocurrency,
      NEW.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER crypto_deposit_completion_trigger
  AFTER UPDATE ON crypto_deposits
  FOR EACH ROW
  EXECUTE FUNCTION handle_crypto_deposit_completion();
