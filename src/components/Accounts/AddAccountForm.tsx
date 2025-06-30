import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Building, DollarSign, AlertCircle, User, ChevronDown } from 'lucide-react';
import { BaseAccount, User as UserType } from '../../types/accounts';
import { formatCurrency } from '../../utils/contributions';

interface AccountFormData {
  type: 'RRSP' | 'TFSA' | 'RPP' | 'DPSP' | 'FHSA' | 'RESP';
  institutionName: string;
  currentBalance: number;
  ownerId: string;
}

interface AddAccountFormProps {
  onSubmit: (account: Omit<BaseAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  userId: string;
  users: UserType[];
  activeUser?: UserType;
  couplePartner?: UserType;
}

const CANADIAN_INSTITUTIONS = [
  'Royal Bank of Canada (RBC)',
  'Toronto-Dominion Bank (TD)',
  'Bank of Nova Scotia (Scotiabank)',
  'Bank of Montreal (BMO)',
  'Canadian Imperial Bank of Commerce (CIBC)',
  'National Bank of Canada',
  'Desjardins Group',
  'EQ Bank',
  'Tangerine',
  'PC Financial',
  'Questrade',
  'Wealthsimple',
  'Interactive Brokers',
  'Qtrade Investor',
  'Disnat',
  'Sun Life Financial',
  'Manulife Financial',
  'Great-West Life',
  'Industrial Alliance',
  'Other'
];

const ACCOUNT_TYPES = [
  {
    type: 'RRSP' as const,
    name: 'Registered Retirement Savings Plan',
    description: 'Tax-deferred retirement savings account',
    color: 'bg-blue-600',
    benefits: ['Tax deductible contributions', 'Tax-deferred growth', 'Spousal RRSP options']
  },
  {
    type: 'TFSA' as const,
    name: 'Tax-Free Savings Account',
    description: 'Tax-free growth and withdrawals',
    color: 'bg-green-600',
    benefits: ['Tax-free growth', 'Flexible withdrawals', 'No age restrictions']
  },
  {
    type: 'RPP' as const,
    name: 'Registered Pension Plan',
    description: 'Employer-sponsored pension plan',
    color: 'bg-purple-600',
    benefits: ['Employer matching', 'Professional management', 'Guaranteed benefits']
  },
  {
    type: 'DPSP' as const,
    name: 'Deferred Profit Sharing Plan',
    description: 'Employer profit-sharing plan',
    color: 'bg-orange-600',
    benefits: ['Employer contributions', 'Profit sharing', 'Vesting schedules']
  },
  {
    type: 'FHSA' as const,
    name: 'First Home Savings Account',
    description: 'Tax-free savings for first-time home buyers',
    color: 'bg-indigo-600',
    benefits: ['Tax deductible contributions', 'Tax-free withdrawals for home purchase', 'Combines RRSP and TFSA benefits']
  },
  {
    type: 'RESP' as const,
    name: 'Registered Education Savings Plan',
    description: 'Education savings with government grants',
    color: 'bg-pink-600',
    benefits: ['Government grants and bonds', 'Tax-deferred growth', 'Tax-free withdrawals for education']
  }
];

export default function AddAccountForm({ 
  onSubmit, 
  onCancel, 
  userId, 
  users, 
  activeUser, 
  couplePartner 
}: AddAccountFormProps) {
  const [institutionInput, setInstitutionInput] = useState('');
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AccountFormData>({
    defaultValues: {
      currentBalance: 0,
      ownerId: userId // Default to current active user
    }
  });

  const selectedType = watch('type');
  const selectedInstitution = watch('institutionName');
  const selectedOwnerId = watch('ownerId');
  const currentBalance = watch('currentBalance') || 0;

  const selectedAccountType = ACCOUNT_TYPES.find(account => account.type === selectedType);
  const selectedOwner = users.find(user => user.id === selectedOwnerId);

  // Filter institutions based on input
  const filteredInstitutions = useMemo(() => {
    if (!institutionInput) return CANADIAN_INSTITUTIONS;
    
    return CANADIAN_INSTITUTIONS.filter(institution =>
      institution.toLowerCase().includes(institutionInput.toLowerCase())
    );
  }, [institutionInput]);

  // Get available users for owner selection
  const availableUsers = React.useMemo(() => {
    if (couplePartner) {
      // In couple view, show both partners
      return [activeUser, couplePartner].filter(Boolean) as UserType[];
    } else {
      // In individual view, only show the active user
      return activeUser ? [activeUser] : [];
    }
  }, [activeUser, couplePartner]);

  const onFormSubmit = (data: AccountFormData) => {
    const newAccount: Omit<BaseAccount, 'id' | 'createdAt' | 'updatedAt'> = {
      type: data.type,
      institutionName: data.institutionName,
      accountNumber: `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, // Generate random masked number
      currentBalance: data.currentBalance,
      contributionRoom: getDefaultContributionRoom(data.type), // Set default based on type
      yearToDateContributions: 0, // Default to 0
      userId: data.ownerId // Use selected owner ID
    };

    onSubmit(newAccount);
  };

  const getDefaultContributionRoom = (type: string): number => {
    switch (type) {
      case 'RRSP': return 31560; // 2024 RRSP limit
      case 'TFSA': return 7000;  // 2024 TFSA limit
      case 'RPP': return 15000;  // Typical RPP room
      case 'DPSP': return 10000; // Typical DPSP room
      case 'FHSA': return 8000;  // 2024 FHSA limit
      case 'RESP': return 2500;  // Annual CESG eligible amount
      default: return 0;
    }
  };

  const handleInstitutionInputChange = (value: string) => {
    setInstitutionInput(value);
    setValue('institutionName', value);
    setShowInstitutionDropdown(true);
    setShowCustomInput(false);
  };

  const handleInstitutionSelect = (institution: string) => {
    if (institution === 'Other') {
      setShowCustomInput(true);
      setInstitutionInput('');
      setValue('institutionName', '');
    } else {
      setInstitutionInput(institution);
      setValue('institutionName', institution);
      setShowCustomInput(false);
    }
    setShowInstitutionDropdown(false);
  };

  const handleCustomInstitutionChange = (value: string) => {
    setInstitutionInput(value);
    setValue('institutionName', value);
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
            <h1 className="text-3xl font-bold text-gray-900">Add New Account</h1>
            <p className="text-gray-600">Add a registered investment account to your portfolio</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Account Owner Selection */}
              <div>
                <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Owner *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <select
                    {...register('ownerId', { required: 'Please select an account owner' })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Choose account owner...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                {couplePartner && (
                  <p className="mt-1 text-xs text-gray-500">
                    Select who owns this account for proper tracking and tax reporting
                  </p>
                )}
                {errors.ownerId && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerId.message}</p>
                )}
              </div>

              {/* Account Type Dropdown */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type *
                </label>
                <select
                  {...register('type', { required: 'Please select an account type' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Choose account type...</option>
                  {ACCOUNT_TYPES.map((accountType) => (
                    <option key={accountType.type} value={accountType.type}>
                      {accountType.type} - {accountType.name}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Financial Institution with Auto-suggest */}
              <div>
                <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-2">
                  Financial Institution *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={16} className="text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-gray-400" />
                  </div>
                  <input
                    {...register('institutionName', { required: 'Please select or enter a financial institution' })}
                    type="text"
                    value={institutionInput}
                    onChange={(e) => handleInstitutionInputChange(e.target.value)}
                    onFocus={() => {
                      setShowInstitutionDropdown(true);
                      handleFieldFocus('institutionName');
                    }}
                    onBlur={handleFieldBlur}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={getPlaceholder('institutionName', 'Type to search institutions...')}
                    autoComplete="off"
                  />
                  
                  {/* Dropdown */}
                  {showInstitutionDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredInstitutions.length > 0 ? (
                        filteredInstitutions.map((institution) => (
                          <button
                            key={institution}
                            type="button"
                            onClick={() => handleInstitutionSelect(institution)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                          >
                            {institution}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No institutions found. Try "Other" to enter custom name.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Custom Institution Input */}
                {showCustomInput && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={institutionInput}
                      onChange={(e) => handleCustomInstitutionChange(e.target.value)}
                      onFocus={() => handleFieldFocus('customInstitution')}
                      onBlur={handleFieldBlur}
                      placeholder={getPlaceholder('customInstitution', 'Enter custom institution name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                )}
                
                {errors.institutionName && (
                  <p className="mt-1 text-sm text-red-600">{errors.institutionName.message}</p>
                )}
              </div>

              {/* Current Balance */}
              <div>
                <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Balance
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    {...register('currentBalance', {
                      min: { value: 0, message: 'Balance cannot be negative' },
                      valueAsNumber: true
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    onFocus={() => handleFieldFocus('currentBalance')}
                    onBlur={handleFieldBlur}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={getPlaceholder('currentBalance', '0.00')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the current balance in your account
                </p>
                {errors.currentBalance && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentBalance.message}</p>
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
                  {isSubmitting ? 'Adding Account...' : 'Add Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Account Preview & Information */}
        <div className="space-y-6">
          {/* Account Preview */}
          {selectedAccountType && selectedOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Preview</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${selectedAccountType.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{selectedAccountType.type}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedAccountType.type}</p>
                    <p className="text-sm text-gray-500">{selectedInstitution || 'Select institution'}</p>
                  </div>
                </div>
                
                {/* Owner Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Account Owner</p>
                      <p className="text-sm text-blue-600">{selectedOwner.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Balance</span>
                    <span className="font-medium text-gray-900">{formatCurrency(currentBalance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <span className="font-medium text-gray-900">{selectedAccountType.name}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Type Benefits */}
          {selectedAccountType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                {selectedAccountType.type} Benefits
              </h3>
              <ul className="text-sm text-green-700 space-y-2">
                {selectedAccountType.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Ensure all information matches your official account statements</li>
                  <li>• Select the correct owner for proper tax reporting</li>
                  <li>• Contribution room limits are set by CRA and your employer</li>
                  <li>• Over-contributions may result in penalties</li>
                  <li>• Keep your account information updated for accurate tracking</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showInstitutionDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowInstitutionDropdown(false)}
        />
      )}
    </div>
  );
}