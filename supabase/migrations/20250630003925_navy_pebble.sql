-- Complete Fresh Database Setup for Canadian Investment Tracker
-- This migration creates everything needed from scratch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Fixed INSERT policy for users (allows spouse creation)
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

-- Insert sample data for testing (optional)
INSERT INTO users (id, name, email, date_of_birth, province, relationship_status, couple_id, contribution_limits, is_primary) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '1985-06-15',
  'Ontario',
  'married',
  '550e8400-e29b-41d4-a716-446655440010'::uuid,
  '{
    "rrsp": {
      "taxYearContributionRoom": 10360.00,
      "totalFirstContributionPeriod": 0.00,
      "totalSecondContributionPeriod": 0.00,
      "totalTaxYearContributions": 0.00,
      "unusedContributions": 5887.48,
      "pensionAdjustment": 4472.52,
      "availableContributionRoom": 5887.48
    },
    "tfsa": {
      "maxAnnual": 7000,
      "cumulativeRoom": 95000,
      "withdrawalRoom": 0
    }
  }'::jsonb,
  true
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'Michael Johnson',
  'michael.johnson@email.com',
  '1983-03-22',
  'Ontario',
  'married',
  '550e8400-e29b-41d4-a716-446655440010'::uuid,
  '{
    "rrsp": {
      "taxYearContributionRoom": 31560,
      "totalFirstContributionPeriod": 0,
      "totalSecondContributionPeriod": 0,
      "totalTaxYearContributions": 0,
      "unusedContributions": 2500,
      "pensionAdjustment": 1200,
      "availableContributionRoom": 32860
    },
    "tfsa": {
      "maxAnnual": 7000,
      "cumulativeRoom": 95000,
      "withdrawalRoom": 1500
    }
  }'::jsonb,
  false
);

-- Insert sample couple
INSERT INTO couples (id, partner1_id, partner2_id, marriage_date, shared_goals) VALUES
(
  '550e8400-e29b-41d4-a716-446655440010'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  '2015-08-20',
  ARRAY[]::uuid[]
);

-- Insert sample accounts
INSERT INTO accounts (id, user_id, type, institution_name, account_number, current_balance, contribution_room, year_to_date_contributions) VALUES
(
  '550e8400-e29b-41d4-a716-446655440021'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'RRSP',
  'TD Bank',
  '****1234',
  45750.50,
  31560,
  12000
),
(
  '550e8400-e29b-41d4-a716-446655440022'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'TFSA',
  'RBC Royal Bank',
  '****5678',
  28900.75,
  7000,
  3500
);

-- Insert sample transactions
INSERT INTO transactions (id, user_id, account_id, type, amount, date, description, category) VALUES
(
  '550e8400-e29b-41d4-a716-446655440041'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440021'::uuid,
  'contribution',
  2500,
  '2024-01-10',
  'Monthly RRSP Contribution',
  'Regular Contribution'
),
(
  '550e8400-e29b-41d4-a716-446655440042'::uuid,
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  '550e8400-e29b-41d4-a716-446655440022'::uuid,
  'contribution',
  1000,
  '2024-01-08',
  'TFSA Deposit',
  'Regular Contribution'
);