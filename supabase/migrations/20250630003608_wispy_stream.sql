/*
  # Clean Database Schema Reset for Canadian Investment Tracker

  1. Drop existing objects safely
  2. Recreate all tables with proper structure
  3. Set up Row Level Security policies
  4. Create indexes and triggers

  This migration safely handles existing objects by dropping them first.
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can insert own and spouse data" ON users;
DROP POLICY IF EXISTS "Users can read own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
DROP POLICY IF EXISTS "Partners can read couple data" ON couples;
DROP POLICY IF EXISTS "Partners can update couple data" ON couples;
DROP POLICY IF EXISTS "Users can create couple relationships" ON couples;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
DROP TRIGGER IF EXISTS update_couples_updated_at ON couples;

-- Drop existing function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing indexes
DROP INDEX IF EXISTS idx_accounts_user_id;
DROP INDEX IF EXISTS idx_accounts_type;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_transactions_account_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_type;
DROP INDEX IF EXISTS idx_goals_user_id;
DROP INDEX IF EXISTS idx_goals_target_date;
DROP INDEX IF EXISTS idx_couples_partner1_id;
DROP INDEX IF EXISTS idx_couples_partner2_id;
DROP INDEX IF EXISTS idx_users_couple_id;
DROP INDEX IF EXISTS idx_users_email;

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS couples CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  date_of_birth date NOT NULL,
  province text NOT NULL,
  relationship_status text NOT NULL DEFAULT 'single',
  couple_id uuid,
  contribution_limits jsonb NOT NULL DEFAULT '{}',
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create accounts table
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('RRSP', 'TFSA', 'RPP', 'DPSP', 'FHSA', 'RESP')),
  institution_name text NOT NULL,
  account_number text NOT NULL,
  current_balance decimal(12,2) NOT NULL DEFAULT 0,
  contribution_room decimal(12,2) NOT NULL DEFAULT 0,
  year_to_date_contributions decimal(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('contribution', 'withdrawal', 'transfer')),
  amount decimal(12,2) NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount decimal(12,2) NOT NULL,
  current_amount decimal(12,2) NOT NULL DEFAULT 0,
  target_date date NOT NULL,
  account_types text[] NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create couples table
CREATE TABLE couples (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner1_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner2_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  marriage_date date,
  shared_goals uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(partner1_id, partner2_id)
);

-- Create indexes for performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_couples_partner1_id ON couples(partner1_id);
CREATE INDEX idx_couples_partner2_id ON couples(partner2_id);
CREATE INDEX idx_users_couple_id ON users(couple_id);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- CLEAN INSERT POLICY FOR USERS (This is the key fix)
CREATE POLICY "Users can insert own and spouse data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to create their own primary profile
    (auth.uid()::text = id::text AND is_primary = true) 
    OR 
    -- Allow authenticated users to create spouse profiles (non-primary users)
    (auth.uid() IS NOT NULL AND is_primary = false)
  );

-- Create RLS policies for accounts table
CREATE POLICY "Users can read own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (
    user_id::text = auth.uid()::text OR
    user_id IN (
      SELECT partner1_id FROM couples WHERE partner2_id::text = auth.uid()::text
      UNION
      SELECT partner2_id FROM couples WHERE partner1_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Create RLS policies for transactions table
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    user_id::text = auth.uid()::text OR
    user_id IN (
      SELECT partner1_id FROM couples WHERE partner2_id::text = auth.uid()::text
      UNION
      SELECT partner2_id FROM couples WHERE partner1_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Create RLS policies for goals table
CREATE POLICY "Users can read own goals"
  ON goals
  FOR SELECT
  TO authenticated
  USING (
    user_id::text = auth.uid()::text OR
    (is_shared = true AND user_id IN (
      SELECT partner1_id FROM couples WHERE partner2_id::text = auth.uid()::text
      UNION
      SELECT partner2_id FROM couples WHERE partner1_id::text = auth.uid()::text
    ))
  );

CREATE POLICY "Users can insert own goals"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own goals"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own goals"
  ON goals
  FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Create RLS policies for couples table
CREATE POLICY "Partners can read couple data"
  ON couples
  FOR SELECT
  TO authenticated
  USING (
    partner1_id::text = auth.uid()::text OR
    partner2_id::text = auth.uid()::text
  );

CREATE POLICY "Partners can update couple data"
  ON couples
  FOR UPDATE
  TO authenticated
  USING (
    partner1_id::text = auth.uid()::text OR
    partner2_id::text = auth.uid()::text
  );

CREATE POLICY "Users can create couple relationships"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (
    partner1_id::text = auth.uid()::text OR
    partner2_id::text = auth.uid()::text
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();