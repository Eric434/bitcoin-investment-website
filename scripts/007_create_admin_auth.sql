-- Create admin authentication table
CREATE TABLE IF NOT EXISTS admin_auth (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default admin credentials (password: Mama4you@)
INSERT INTO admin_auth (username, password_hash) 
VALUES ('master@admin.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_auth ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only (will be handled in server-side code)
CREATE POLICY "Admin auth access" ON admin_auth FOR ALL USING (false);
