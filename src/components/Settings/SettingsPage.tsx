import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Heart, UserPlus, Users, Trash2, Save, Edit3, Shield, Download, LogOut, Lock, FileText, Calculator } from 'lucide-react';
import { User as UserType } from '../../types/accounts';
import { useForm } from 'react-hook-form';
import CRALimitsModal from './CRALimitsModal';

interface SettingsPageProps {
  activeUser?: UserType;
  couplePartner?: UserType;
  primaryUser?: UserType;
  additionalUser?: UserType;
  onSignOut: () => void;
  onUpdateUser?: (updates: any) => void;
  onAddSpouse?: (spouseData: any) => void;
  onRemoveSpouse?: () => void;
}

interface ProfileFormData {
  name: string;
  email: string;
}

interface SpouseFormData {
  name: string;
}

export default function SettingsPage({ 
  activeUser, 
  couplePartner, 
  primaryUser,
  additionalUser,
  onSignOut, 
  onUpdateUser,
  onAddSpouse,
  onRemoveSpouse 
}: SettingsPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSpouseForm, setShowAddSpouseForm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showCRALimitsModal, setShowCRALimitsModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: activeUser?.name || '',
      email: activeUser?.email || ''
    }
  });

  const {
    register: registerSpouse,
    handleSubmit: handleSubmitSpouse,
    reset: resetSpouse,
    formState: { errors: spouseErrors, isSubmitting: isSubmittingSpouse }
  } = useForm<SpouseFormData>();

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (onUpdateUser) {
        await onUpdateUser({
          name: data.name,
          email: data.email
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  const onSpouseSubmit = (data: SpouseFormData) => {
    const spouseData = {
      name: data.name,
      email: 'additional.user@example.com', // Placeholder email (not used for login)
      date_of_birth: '1990-01-01', // Default date
      province: 'Ontario', // Default province
      relationship_status: 'married',
      is_primary: false, // This is the additional user
      contribution_limits: {
        rrsp: {
          taxYearContributionRoom: 31560,
          totalFirstContributionPeriod: 0,
          totalSecondContributionPeriod: 0,
          totalTaxYearContributions: 0,
          unusedContributions: 0,
          pensionAdjustment: 0,
          availableContributionRoom: 31560
        },
        tfsa: {
          maxAnnual: 7000,
          cumulativeRoom: 95000,
          withdrawalRoom: 0
        }
      }
    };

    if (onAddSpouse) {
      onAddSpouse(spouseData);
    }
    setShowAddSpouseForm(false);
    resetSpouse();
  };

  const handleCancelSpouseForm = () => {
    setShowAddSpouseForm(false);
    resetSpouse();
  };

  const handleRemoveSpouse = () => {
    if (onRemoveSpouse) {
      onRemoveSpouse();
    }
    setShowRemoveConfirm(false);
  };

  const handleCRALimitsSubmit = async (limits: any) => {
    try {
      if (onUpdateUser) {
        await onUpdateUser({
          contribution_limits: limits
        });
      }
      setShowCRALimitsModal(false);
    } catch (error) {
      console.error('Error updating CRA limits:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <User size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <p className="text-gray-600">Manage your personal information and account preferences</p>
          </div>
        </div>
        
        {/* Account Type Indicator */}
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
            <User size={16} />
            <span className="font-medium">
              {additionalUser ? 'Couple Account' : 'Individual Account'}
            </span>
          </div>
          {additionalUser && (
            <div className="text-sm text-gray-600">
              Shared login • {primaryUser?.name} & {additionalUser.name}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Holders */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users size={20} className="mr-2 text-gray-600" />
                Account Holders
              </h3>
              <div className="text-sm text-gray-500">
                {additionalUser ? '2 of 2 holders' : '1 of 2 holders'}
              </div>
            </div>

            <div className="space-y-4">
              {/* Primary User */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">
                      {primaryUser?.name || activeUser?.name || 'Primary User'}
                    </p>
                    <p className="text-sm text-blue-600">
                      Primary account holder • Login credentials
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Additional User or Add Option */}
              {additionalUser ? (
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">
                        {additionalUser.name}
                      </p>
                      <p className="text-sm text-purple-600">
                        Additional account holder • Shared login
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                </div>
              ) : showAddSpouseForm ? (
                <div className="border border-blue-300 rounded-lg p-6 bg-blue-50">
                  <form onSubmit={handleSubmitSpouse(onSpouseSubmit)} className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900">Add Spouse/Partner</h4>
                        <p className="text-sm text-blue-700">Enter their full name to add them as an additional account holder</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="spouseName" className="block text-sm font-medium text-blue-800 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-blue-500" />
                        </div>
                        <input
                          {...registerSpouse('name', { 
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          onFocus={() => handleFieldFocus('spouseName')}
                          onBlur={handleFieldBlur}
                          className="w-full pl-10 pr-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder={getPlaceholder('spouseName', 'Enter full name')}
                        />
                      </div>
                      {spouseErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{spouseErrors.name.message}</p>
                      )}
                    </div>

                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Both account holders will share the same login credentials and have equal access to all account data.
                      </p>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingSpouse}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <UserPlus size={16} />
                        <span>{isSubmittingSpouse ? 'Adding...' : 'Add Partner'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSpouseForm}
                        className="px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlus size={20} className="text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Add Spouse/Partner</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Add your spouse or partner as a second account holder for joint financial planning.
                  </p>
                  <button
                    onClick={() => setShowAddSpouseForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <UserPlus size={16} />
                    <span>Add Spouse/Partner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          {...register('name', { 
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          onFocus={() => handleFieldFocus('name')}
                          onBlur={handleFieldBlur}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder={getPlaceholder('name', 'Enter your full name')}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          type="email"
                          onFocus={() => handleFieldFocus('email')}
                          onBlur={handleFieldBlur}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder={getPlaceholder('email', 'Enter your email address')}
                          disabled={additionalUser ? true : false}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                      {additionalUser && (
                        <p className="mt-1 text-xs text-gray-500">
                          Email is shared between both account holders
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save size={16} />
                      <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Benefits Info */}
            {additionalUser && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Shared Account Benefits</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Combined account overview and reporting</li>
                    <li>• Shared financial goals and planning</li>
                    <li>• Joint contribution tracking and optimization</li>
                    <li>• Single login for both account holders</li>
                    <li>• Individual account ownership maintained</li>
                  </ul>
                </div>
              </div>
            )}
          </motion.div>

          {/* CRA Contribution Limits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText size={20} className="mr-2 text-gray-600" />
                CRA Contribution Limits
              </h3>
              <button
                onClick={() => setShowCRALimitsModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Calculator size={16} />
                <span>Update Limits</span>
              </button>
            </div>

            {activeUser?.contributionLimits ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RRSP */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">RRSP</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Available Room</span>
                      <span className="font-medium text-blue-800">
                        {formatCurrency(activeUser.contributionLimits.rrsp.availableContributionRoom)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Tax Year Room</span>
                      <span className="font-medium text-blue-800">
                        {formatCurrency(activeUser.contributionLimits.rrsp.taxYearContributionRoom)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-600">Unused Room</span>
                      <span className="font-medium text-blue-800">
                        {formatCurrency(activeUser.contributionLimits.rrsp.unusedContributions)}
                      </span>
                    </div>
                    {activeUser.contributionLimits.rrsp.pensionAdjustment > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-600">Pension Adj.</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(activeUser.contributionLimits.rrsp.pensionAdjustment)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TFSA */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">TFSA</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Contribution Room</span>
                      <span className="font-medium text-green-800">
                        {formatCurrency(activeUser.contributionLimits.tfsa.cumulativeRoom)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-green-600">Annual Limit</span>
                      <span className="font-medium text-green-800">
                        {formatCurrency(activeUser.contributionLimits.tfsa.maxAnnual)}
                      </span>
                    </div>
                    {activeUser.contributionLimits.tfsa.withdrawalRoom > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-green-600">Withdrawal Room</span>
                        <span className="font-medium text-green-800">
                          {formatCurrency(activeUser.contributionLimits.tfsa.withdrawalRoom)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* FHSA */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-3">FHSA</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Available Room</span>
                      <span className="font-medium text-indigo-800">
                        {activeUser.contributionLimits.fhsa ? 
                          formatCurrency(activeUser.contributionLimits.fhsa.availableRoom || 8000) : 
                          formatCurrency(8000)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Annual Limit</span>
                      <span className="font-medium text-indigo-800">
                        {formatCurrency(8000)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-indigo-600">Lifetime Limit</span>
                      <span className="font-medium text-indigo-800">
                        {formatCurrency(40000)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No CRA limits set</p>
                <button
                  onClick={() => setShowCRALimitsModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Enter CRA Limits
                </button>
              </div>
            )}

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Enter your actual limits from your CRA Notice of Assessment for accurate contribution tracking. The system will automatically adjust your RRSP room when you record RPP or DPSP contributions.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-gray-600" />
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="font-medium text-gray-900">
                  {additionalUser ? 'Shared Account' : 'Individual Account'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Holders</span>
                <span className="font-medium text-gray-900">
                  {additionalUser ? '2 Holders' : '1 Holder'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">
                  {activeUser?.createdAt 
                    ? new Date(activeUser.createdAt).toLocaleDateString() 
                    : 'Recently'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Email & Security Combined */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock size={20} className="mr-2 text-gray-600" />
              Email & Security
            </h3>
            
            {/* Current Email */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Mail size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Login Email</span>
              </div>
              <p className="text-gray-900 font-medium">{activeUser?.email || 'Not set'}</p>
              {additionalUser && (
                <p className="text-xs text-gray-500 mt-1">Shared by both account holders</p>
              )}
            </div>

            {/* Security Options */}
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="font-medium text-gray-900">Change Password</div>
                <div className="text-sm text-gray-600">
                  {additionalUser ? 'Updates login for both holders' : 'Update your account password'}
                </div>
              </button>
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Download size={20} className="mr-2 text-gray-600" />
              Data Management
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="font-medium text-gray-900">Export Data</div>
                <div className="text-sm text-gray-600">
                  {additionalUser ? 'Download data for both holders' : 'Download your account data'}
                </div>
              </button>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                onClick={onSignOut}
                className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <LogOut size={16} className="mr-2 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Sign Out</div>
                    <div className="text-sm text-red-600">
                      {additionalUser ? 'Sign out (affects both holders)' : 'Sign out of your account'}
                    </div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 cursor-not-allowed">
                <div className="font-medium text-gray-500">Delete Account</div>
                <div className="text-sm text-gray-400">
                  {additionalUser ? 'Permanently delete shared account' : 'Permanently delete your account'}
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Remove Spouse Confirmation */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Remove Additional Account Holder</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove {additionalUser?.name} as an additional account holder? This will disable shared features and return to individual account mode.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleRemoveSpouse}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Remove Holder
              </button>
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CRA Limits Modal */}
      {showCRALimitsModal && (
        <CRALimitsModal
          onClose={() => setShowCRALimitsModal(false)}
          onSubmit={handleCRALimitsSubmit}
          currentLimits={activeUser?.contributionLimits}
          userName={activeUser?.name || 'User'}
        />
      )}
    </div>
  );
}