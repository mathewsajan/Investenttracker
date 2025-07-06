import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, Target, PieChart, Users, User, ChevronDown } from 'lucide-react';
import { BaseAccount, Transaction, User as UserType } from '../../types/accounts';
import { formatCurrency } from '../../utils/contributions';
import { db } from '../../lib/supabase';
import { useAuthContext } from '../Auth/AuthProvider';
import AddAccountForm from '../Accounts/AddAccountForm';
import AddTransactionForm from '../Transactions/AddTransactionForm';

interface DashboardProps {
  activeUser?: UserType;
  couplePartner?: UserType;
  primaryUser?: UserType;
  additionalUser?: UserType;
  onUserSwitch?: (userId: string) => void;
}

export default function Dashboard({ 
  activeUser, 
  couplePartner, 
  primaryUser, 
  additionalUser,
  onUserSwitch 
}: DashboardProps) {
  const { user } = useAuthContext();
  const [accounts, setAccounts] = useState<BaseAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Get available users for switching
  const availableUsers = React.useMemo(() => {
    if (additionalUser && primaryUser) {
      return [primaryUser, additionalUser];
    }
    return activeUser ? [activeUser] : [];
  }, [activeUser, primaryUser, additionalUser]);

  useEffect(() => {
    if (user && activeUser) {
      loadData();
    }
  }, [user, activeUser]);

  const loadData = async () => {
    if (!activeUser) return;
    
    setLoading(true);
    setError(null);

    try {
      // Load accounts for the active user
      const { data: accountsData, error: accountsError } = await db.getAccounts(activeUser.id);
      if (accountsError) {
        throw accountsError;
      }

      // Load transactions for the active user
      const { data: transactionsData, error: transactionsError } = await db.getTransactions(activeUser.id);
      if (transactionsError) {
        throw transactionsError;
      }

      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (accountData: Omit<BaseAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await db.createAccount(accountData);
      if (error) {
        throw error;
      }

      if (data) {
        setAccounts(prev => [data, ...prev]);
      }
      setShowAddAccount(false);
    } catch (err) {
      console.error('Error adding account:', err);
      setError('Failed to add account');
    }
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      const { data, error } = await db.createTransaction(transactionData);
      if (error) {
        throw error;
      }

      if (data) {
        setTransactions(prev => [data, ...prev]);
        
        // Update account balance
        const account = accounts.find(acc => acc.id === transactionData.accountId);
        if (account) {
          const balanceChange = transactionData.type === 'withdrawal' 
            ? -transactionData.amount 
            : transactionData.amount;
          
          const updatedAccount = {
            ...account,
            currentBalance: account.currentBalance + balanceChange,
            yearToDateContributions: transactionData.type === 'contribution' 
              ? account.yearToDateContributions + transactionData.amount
              : account.yearToDateContributions
          };

          await db.updateAccount(account.id, updatedAccount);
          setAccounts(prev => prev.map(acc => 
            acc.id === account.id ? updatedAccount : acc
          ));
        }
      }
      setShowAddTransaction(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
    }
  };

  // Calculate portfolio summary
  const portfolioSummary = React.useMemo(() => {
    const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const totalContributions = accounts.reduce((sum, account) => sum + account.yearToDateContributions, 0);
    const totalRoom = accounts.reduce((sum, account) => sum + account.contributionRoom, 0);
    const remainingRoom = totalRoom - totalContributions;

    return {
      totalBalance,
      totalContributions,
      totalRoom,
      remainingRoom
    };
  }, [accounts]);

  // Group accounts by type
  const accountsByType = React.useMemo(() => {
    return accounts.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = [];
      }
      acc[account.type].push(account);
      return acc;
    }, {} as Record<string, BaseAccount[]>);
  }, [accounts]);

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'RRSP': return 'bg-blue-600';
      case 'TFSA': return 'bg-green-600';
      case 'RPP': return 'bg-purple-600';
      case 'DPSP': return 'bg-orange-600';
      case 'FHSA': return 'bg-indigo-600';
      case 'RESP': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  if (showAddAccount) {
    return (
      <AddAccountForm
        onSubmit={handleAddAccount}
        onCancel={() => setShowAddAccount(false)}
        userId={activeUser?.id || ''}
        users={availableUsers}
        activeUser={activeUser}
        couplePartner={couplePartner}
      />
    );
  }

  if (showAddTransaction) {
    return (
      <AddTransactionForm
        accounts={accounts}
        onSubmit={handleAddTransaction}
        onCancel={() => setShowAddTransaction(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Investment Portfolio
          </h1>
          <p className="text-gray-600">
            {additionalUser ? 'Shared portfolio overview' : 'Your investment account overview'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Switcher */}
          {additionalUser && onUserSwitch && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <User size={16} className="text-gray-600" />
                <span className="font-medium text-gray-900">
                  {activeUser?.name || 'Select User'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserSwitch(user.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        activeUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <User size={16} />
                        <span>{user.name}</span>
                        {user.isPrimary && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <button
            onClick={() => setShowAddTransaction(true)}
            disabled={accounts.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
          
          <button
            onClick={() => setShowAddAccount(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioSummary.totalBalance)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">YTD Contributions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioSummary.totalContributions)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining Room</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioSummary.remainingRoom)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target size={24} className="text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart size={24} className="text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Accounts by Type */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(accountsByType).map(([type, typeAccounts]) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${getAccountTypeColor(type)} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{type}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{type} Accounts</h3>
                  <p className="text-sm text-gray-600">{typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-3">
                {typeAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{account.institutionName}</p>
                      <p className="text-sm text-gray-600">{account.accountNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(account.currentBalance)}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(account.contributionRoom - account.yearToDateContributions)} room left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accounts Yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first registered investment account.
          </p>
          <button
            onClick={() => setShowAddAccount(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mx-auto"
          >
            <Plus size={20} />
            <span>Add Your First Account</span>
          </button>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => {
              const account = accounts.find(acc => acc.id === transaction.accountId);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getAccountTypeColor(account?.type || '')} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs">{account?.type}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.date.toLocaleDateString()} • {account?.institutionName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'contribution' ? 'text-green-600' : 
                      transaction.type === 'withdrawal' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{transaction.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Click outside to close dropdown */}
      {showUserDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </div>
  );
}