export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  province: string;
  relationshipStatus: 'single' | 'married' | 'common-law';
  coupleId?: string;
  contributionLimits: ContributionLimits;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContributionLimits {
  rrsp: {
    taxYearContributionRoom: number;
    totalFirstContributionPeriod: number;
    totalSecondContributionPeriod: number;
    totalTaxYearContributions: number;
    unusedContributions: number;
    pensionAdjustment: number;
    availableContributionRoom: number;
  };
  tfsa: {
    maxAnnual: number;
    cumulativeRoom: number;
    withdrawalRoom: number;
  };
  fhsa?: {
    annualLimit: number;
    lifetimeLimit: number;
    totalContributed: number;
    availableRoom: number;
  };
}

export interface BaseAccount {
  id: string;
  type: 'RRSP' | 'TFSA' | 'RPP' | 'DPSP' | 'FHSA' | 'RESP';
  institutionName: string;
  accountNumber: string;
  currentBalance: number;
  contributionRoom: number;
  yearToDateContributions: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: 'contribution' | 'withdrawal' | 'transfer';
  amount: number;
  date: Date;
  description: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  accountTypes: string[];
  priority: 'low' | 'medium' | 'high';
  isShared?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Couple {
  id: string;
  partner1Id: string;
  partner2Id: string;
  marriageDate?: Date;
  sharedGoals?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Database row types (snake_case)
export interface UserRow {
  id: string;
  name: string;
  email: string;
  date_of_birth: string;
  province: string;
  relationship_status: string;
  couple_id?: string;
  contribution_limits: any;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  type: string;
  institution_name: string;
  account_number: string;
  current_balance: number;
  contribution_room: number;
  year_to_date_contributions: number;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// Utility functions to convert between camelCase and snake_case
export function userRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    dateOfBirth: row.date_of_birth,
    province: row.province,
    relationshipStatus: row.relationship_status as 'single' | 'married' | 'common-law',
    coupleId: row.couple_id,
    contributionLimits: row.contribution_limits as ContributionLimits,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function userToUserRow(user: Partial<User>): Partial<UserRow> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    date_of_birth: user.dateOfBirth,
    province: user.province,
    relationship_status: user.relationshipStatus,
    couple_id: user.coupleId,
    contribution_limits: user.contributionLimits,
    is_primary: user.isPrimary,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
}

export function accountRowToAccount(row: AccountRow): BaseAccount {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as 'RRSP' | 'TFSA' | 'RPP' | 'DPSP' | 'FHSA' | 'RESP',
    institutionName: row.institution_name,
    accountNumber: row.account_number,
    currentBalance: row.current_balance,
    contributionRoom: row.contribution_room,
    yearToDateContributions: row.year_to_date_contributions,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function accountToAccountRow(account: Partial<BaseAccount>): Partial<AccountRow> {
  return {
    id: account.id,
    user_id: account.userId,
    type: account.type,
    institution_name: account.institutionName,
    account_number: account.accountNumber,
    current_balance: account.currentBalance,
    contribution_room: account.contributionRoom,
    year_to_date_contributions: account.yearToDateContributions,
    created_at: account.createdAt,
    updated_at: account.updatedAt
  };
}

export function transactionRowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    type: row.type as 'contribution' | 'withdrawal' | 'transfer',
    amount: row.amount,
    date: new Date(row.date),
    description: row.description,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function transactionToTransactionRow(transaction: Partial<Transaction>): Partial<TransactionRow> {
  return {
    id: transaction.id,
    user_id: transaction.userId,
    account_id: transaction.accountId,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date?.toISOString().split('T')[0],
    description: transaction.description,
    category: transaction.category,
    created_at: transaction.createdAt,
    updated_at: transaction.updatedAt
  };
}