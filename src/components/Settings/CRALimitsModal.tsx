import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, FileText, Calculator, AlertCircle, DollarSign, Info } from 'lucide-react';

interface CRALimitsModalProps {
  onClose: () => void;
  onSubmit: (limits: CRALimitsData) => void;
  currentLimits?: any;
  userName: string;
}

interface CRALimitsData {
  rrsp: {
    taxYearContributionRoom: number;
    unusedContributions: number;
    pensionAdjustment: number;
  };
  tfsa: {
    contributionRoom: number;
    withdrawalRoom: number;
  };
  fhsa: {
    contributionRoom: number;
    lifetimeLimit: number;
    totalContributed: number;
  };
  earnedIncome: number;
  taxYear: number;
}

export default function CRALimitsModal({ onClose, onSubmit, currentLimits, userName }: CRALimitsModalProps) {
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CRALimitsData>({
    defaultValues: {
      rrsp: {
        taxYearContributionRoom: currentLimits?.rrsp?.taxYearContributionRoom || 0,
        unusedContributions: currentLimits?.rrsp?.unusedContributions || 0,
        pensionAdjustment: currentLimits?.rrsp?.pensionAdjustment || 0,
      },
      tfsa: {
        contributionRoom: currentLimits?.tfsa?.cumulativeRoom || 0,
        withdrawalRoom: currentLimits?.tfsa?.withdrawalRoom || 0,
      },
      fhsa: {
        contributionRoom: 8000, // 2024 annual limit
        lifetimeLimit: 40000,
        totalContributed: 0,
      },
      earnedIncome: 0,
      taxYear: currentYear - 1, // Previous tax year
    }
  });

  const watchedValues = watch();

  const onFormSubmit = (data: CRALimitsData) => {
    // Calculate available RRSP room
    const availableRRSPRoom = data.rrsp.taxYearContributionRoom + data.rrsp.unusedContributions - data.rrsp.pensionAdjustment;
    
    // Calculate available FHSA room
    const availableFHSARoom = Math.min(data.fhsa.contributionRoom, data.fhsa.lifetimeLimit - data.fhsa.totalContributed);

    const formattedLimits = {
      rrsp: {
        taxYearContributionRoom: data.rrsp.taxYearContributionRoom,
        totalFirstContributionPeriod: 0,
        totalSecondContributionPeriod: 0,
        totalTaxYearContributions: 0,
        unusedContributions: data.rrsp.unusedContributions,
        pensionAdjustment: data.rrsp.pensionAdjustment,
        availableContributionRoom: availableRRSPRoom,
      },
      tfsa: {
        maxAnnual: 7000, // 2024 limit
        cumulativeRoom: data.tfsa.contributionRoom,
        withdrawalRoom: data.tfsa.withdrawalRoom,
      },
      fhsa: {
        annualLimit: data.fhsa.contributionRoom,
        lifetimeLimit: data.fhsa.lifetimeLimit,
        totalContributed: data.fhsa.totalContributed,
        availableRoom: availableFHSARoom,
      },
      earnedIncome: data.earnedIncome,
      taxYear: data.taxYear,
    };

    onSubmit(formattedLimits);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Update CRA Contribution Limits</h3>
              <p className="text-sm text-gray-600">Enter limits from your Notice of Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator size={24} className="text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">CRA Notice of Assessment</h4>
                <p className="text-gray-600 mb-6">
                  To ensure accurate contribution tracking, please enter the limits from your most recent CRA Notice of Assessment for {userName}.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">What you'll need:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your {currentYear - 1} Notice of Assessment from CRA</li>
                  <li>• RRSP deduction limit for {currentYear}</li>
                  <li>• TFSA contribution room information</li>
                  <li>• FHSA contribution room (if applicable)</li>
                  <li>• Any pension adjustments from employer plans</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-1">Important:</h5>
                    <p className="text-sm text-yellow-700">
                      These limits are specific to each individual. If you have a spouse/partner, they will need to enter their own limits separately.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Enter Your CRA Limits</h4>
                <p className="text-gray-600">All amounts should be in Canadian dollars as shown on your Notice of Assessment.</p>
              </div>

              {/* Tax Year */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label htmlFor="taxYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Year *
                </label>
                <select
                  {...register('taxYear', { required: 'Tax year is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={currentYear - 1}>{currentYear - 1} (Most Recent)</option>
                  <option value={currentYear - 2}>{currentYear - 2}</option>
                  <option value={currentYear - 3}>{currentYear - 3}</option>
                </select>
                {errors.taxYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.taxYear.message}</p>
                )}
              </div>

              {/* Earned Income */}
              <div>
                <label htmlFor="earnedIncome" className="block text-sm font-medium text-gray-700 mb-2">
                  Earned Income for {watchedValues.taxYear} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    {...register('earnedIncome', {
                      required: 'Earned income is required',
                      min: { value: 0, message: 'Earned income cannot be negative' },
                      valueAsNumber: true
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    onFocus={() => handleFieldFocus('earnedIncome')}
                    onBlur={handleFieldBlur}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={getPlaceholder('earnedIncome', '0.00')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Found on line 26000 of your tax return
                </p>
                {errors.earnedIncome && (
                  <p className="mt-1 text-sm text-red-600">{errors.earnedIncome.message}</p>
                )}
              </div>

              {/* RRSP Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-4 flex items-center">
                  <Calculator size={16} className="mr-2" />
                  RRSP Contribution Limits
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      RRSP Deduction Limit for {currentYear} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-blue-500" />
                      </div>
                      <input
                        {...register('rrsp.taxYearContributionRoom', {
                          required: 'RRSP deduction limit is required',
                          min: { value: 0, message: 'Cannot be negative' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onFocus={() => handleFieldFocus('rrspTaxYear')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder={getPlaceholder('rrspTaxYear', '0.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-blue-600">
                      From your Notice of Assessment
                    </p>
                    {errors.rrsp?.taxYearContributionRoom && (
                      <p className="mt-1 text-sm text-red-600">{errors.rrsp.taxYearContributionRoom.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Unused RRSP Contributions
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-blue-500" />
                      </div>
                      <input
                        {...register('rrsp.unusedContributions', {
                          min: { value: 0, message: 'Cannot be negative' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onFocus={() => handleFieldFocus('rrspUnused')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder={getPlaceholder('rrspUnused', '0.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-blue-600">
                      Carry-forward from previous years
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Pension Adjustment
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-blue-500" />
                      </div>
                      <input
                        {...register('rrsp.pensionAdjustment', {
                          min: { value: 0, message: 'Cannot be negative' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onFocus={() => handleFieldFocus('rrspPension')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder={getPlaceholder('rrspPension', '0.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-blue-600">
                      From employer pension plans
                    </p>
                  </div>

                  <div className="bg-blue-100 border border-blue-300 rounded-md p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Available RRSP Room:</p>
                    <p className="text-lg font-bold text-blue-900">
                      ${((watchedValues.rrsp?.taxYearContributionRoom || 0) + 
                         (watchedValues.rrsp?.unusedContributions || 0) - 
                         (watchedValues.rrsp?.pensionAdjustment || 0)).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* TFSA Section */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-4 flex items-center">
                  <Calculator size={16} className="mr-2" />
                  TFSA Contribution Room
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      TFSA Contribution Room *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-green-500" />
                      </div>
                      <input
                        {...register('tfsa.contributionRoom', {
                          required: 'TFSA contribution room is required',
                          min: { value: 0, message: 'Cannot be negative' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onFocus={() => handleFieldFocus('tfsaRoom')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        placeholder={getPlaceholder('tfsaRoom', '0.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-green-600">
                      Total available contribution room
                    </p>
                    {errors.tfsa?.contributionRoom && (
                      <p className="mt-1 text-sm text-red-600">{errors.tfsa.contributionRoom.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Withdrawal Room
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-green-500" />
                      </div>
                      <input
                        {...register('tfsa.withdrawalRoom', {
                          min: { value: 0, message: 'Cannot be negative' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onFocus={() => handleFieldFocus('tfsaWithdrawal')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                        placeholder={getPlaceholder('tfsaWithdrawal', '0.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-green-600">
                      From previous withdrawals
                    </p>
                  </div>
                </div>
              </div>

              {/* FHSA Section */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h5 className="font-medium text-indigo-800 mb-4 flex items-center">
                  <Calculator size={16} className="mr-2" />
                  FHSA (First Home Savings Account)
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      Annual Contribution Room
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-indigo-500" />
                      </div>
                      <input
                        {...register('fhsa.contributionRoom', {
                          min: { value: 0, message: 'Cannot be negative' },
                          max: { value: 8000, message: 'Cannot exceed $8,000' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        max="8000"
                        onFocus={() => handleFieldFocus('fhsaAnnual')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder={getPlaceholder('fhsaAnnual', '8000.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-indigo-600">
                      Maximum $8,000 per year
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      Lifetime Limit
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-indigo-500" />
                      </div>
                      <input
                        {...register('fhsa.lifetimeLimit', {
                          min: { value: 0, message: 'Cannot be negative' },
                          max: { value: 40000, message: 'Cannot exceed $40,000' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        max="40000"
                        onFocus={() => handleFieldFocus('fhsaLifetime')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder={getPlaceholder('fhsaLifetime', '40000.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-indigo-600">
                      Maximum $40,000 lifetime
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-2">
                      Total Contributed
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-indigo-500" />
                      </div>
                      <input
                        {...register('fhsa.totalContributed', {
                          min: { value: 0, message: 'Cannot be negative' },
                          valueAsNumber: true
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onFocus={() => handleFieldFocus('fhsaContributed')}
                        onBlur={handleFieldBlur}
                        className="w-full pl-10 pr-3 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder={getPlaceholder('fhsaContributed', '0.00')}
                      />
                    </div>
                    <p className="mt-1 text-xs text-indigo-600">
                      Amount contributed to date
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Automatic Pension Adjustments:</h5>
                    <p className="text-sm text-gray-600">
                      When you record RPP or DPSP contributions, the system will automatically update your pension adjustment to reduce your RRSP room accordingly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Limits'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}