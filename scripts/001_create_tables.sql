-- Create users table for lunch tracking
CREATE TABLE IF NOT EXISTS lunch_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create lunch entries table
CREATE TABLE IF NOT EXISTS lunch_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_expense DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shares table (who owes what for each lunch)
CREATE TABLE IF NOT EXISTS lunch_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES lunch_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES lunch_users(id) ON DELETE CASCADE,
  share_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  UNIQUE(entry_id, user_id)
);

-- Create payments table (who paid what for each lunch)
CREATE TABLE IF NOT EXISTS lunch_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES lunch_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES lunch_users(id) ON DELETE CASCADE,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  UNIQUE(entry_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lunch_shares_entry ON lunch_shares(entry_id);
CREATE INDEX IF NOT EXISTS idx_lunch_shares_user ON lunch_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_lunch_payments_entry ON lunch_payments(entry_id);
CREATE INDEX IF NOT EXISTS idx_lunch_payments_user ON lunch_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_lunch_entries_date ON lunch_entries(date);
