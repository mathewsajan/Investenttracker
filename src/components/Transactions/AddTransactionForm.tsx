import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { BaseAccount, Transaction } from '../../types/accounts';
import { formatCurrency } from '../../utils/contributions';

interface TransactionFormData {
  accountId: string;
  type: 'contribution' | 'withdrawal' | 'transfer';
  amount: number;
  date: string;
}

interface AddTransactionFormProps {
  accounts: BaseAccount[];
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

export default function AddTransactionForm({ accounts, onSubmit, onCancel }: AddTransactionFormProps) {
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'contribution'
    }
  });

  const selectedAccountId = watch('accountId');
  const transactionType = watch('type');
  const selectedAccount = accounts.find(account => account.id === selectedAccountId);

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'contribution': return 'text-green-600 bg-green-100 border-green-200';
      case 'withdrawal': return 'text-red-600 bg-red-100 border-red-200';
      case 'transfer': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

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

  const generateDescription = (type: string, accountType: string, amount: number) => {
    const formattedAmount = formatCurrency(amount);
    switch (type) {
      case 'contribution':
        return `${accountType} contribution of ${formattedAmount}`;
      case 'withdrawal':
        return `${accountType} withdrawal of ${formattedAmount}`;
      case 'transfer':
        return `${accountType} transfer of ${formattedAmount}`;
      default:
        return `${accountType} transaction of ${formattedAmount}`;
    }
  };

  const onFormSubmit = (data: TransactionFormData) => {
    const account = accounts.find(acc => acc.id === data.accountId);
    if (!account) return;

    const description = generateDescription(data.type, account.type, data.amount);

    const newTransaction: Omit<Transaction, 'id'> = {
      userId: account.userId,
      accountId: data.accountId,
      type: data.type,
      amount: data.amount,
      date: new Date(data.date),
      description: description,
      category: 'Manual Entry'
    };

    onSubmit(newTransaction);
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const getPlaceholder = (fieldName: string, defaultPlaceholder: string) => {
    return focusedField === fieldName ? '' : defaultPlaceholder;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onCancel}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Transaction</h1>
            <p className="text-gray-600">Record a new transaction for your registered accounts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Account Selection */}
              <div>
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Account *
                </label>
                <select
                  {...register('accountId', { required: 'Please select an account' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Choose an account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.type} - {account.institutionName}
                    </option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountId.message}</p>
                )}
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'contribution', label: 'Contribution', description: 'Add money to account' },
                    { value: 'withdrawal', label: 'Withdrawal', description: 'Remove money from account' },
                    { value: 'transfer', label: 'Transfer', description: 'Move money between accounts' }
                  ].map((type) => (
                    <label key={type.value} className="relative">
                      <input
                        {...register('type', { required: 'Please select a transaction type' })}
                        type="radio"
                        value={type.value}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        transactionType === type.value
                          ? getTransactionTypeColor(type.value)
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="text-center">
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than $0.00' },
                      valueAsNumber: true
                    })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    onFocus={() => handleFieldFocus('amount')}
                    onBlur={handleFieldBlur}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={getPlaceholder('amount', '0.00')}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    {...register('date', { required: 'Date is required' })}
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Transaction Preview & Account Info */}
        <div className="space-y-6">
          {/* Selected Account Info */}
          {selectedAccount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard size={20} className="mr-2" />
                Selected Account
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getAccountTypeColor(selectedAccount.type)} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{selectedAccount.type}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedAccount.type}</p>
                    <p className="text-sm text-gray-500">{selectedAccount.institutionName}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Balance</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedAccount.currentBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">YTD Contributions</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedAccount.yearToDateContributions)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining Room</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(selectedAccount.contributionRoom - selectedAccount.yearToDateContributions)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Transaction Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Transaction Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Ensure transaction dates are accurate for tax reporting</li>
              <li>• RRSP contributions before March 1st count for previous tax year</li>
              <li>• Monitor contribution limits to avoid over-contribution penalties</li>
              <li>• Keep receipts and documentation for all transactions</li>
              <li>• Withdrawals from RRSP are taxable income</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}