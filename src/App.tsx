import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './components/Auth/AuthProvider';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import Dashboard from './components/Dashboard/Dashboard';
import SettingsPage from './components/Settings/SettingsPage';
import { User } from './types/accounts';
import { db } from './lib/supabase';
import { LogOut, Settings, Home, User as UserIcon, ChevronDown } from 'lucide-react';

function AppContent() {
  const { user, userProfile, loading, signOut } = useAuthContext();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [additionalUser, setAdditionalUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Set active user when userProfile loads
  useEffect(() => {
    if (userProfile && !activeUserId) {
      setActiveUserId(userProfile.id);
    }
  }, [userProfile, activeUserId]);

  // Load additional user (spouse/partner) if exists
  useEffect(() => {
    const loadAdditionalUser = async () => {
      if (!userProfile) return;

      try {
        // Look for a non-primary user associated with the same auth user
        // This is a simplified approach - in a real app you'd have proper couple relationships
        const { data: users, error } = await db.getAccounts(); // This would need to be modified to get users
        
        // For now, we'll simulate finding an additional user
        // In the real implementation, you'd query for users with the same couple_id
        
      } catch (error) {
        console.error('Error loading additional user:', error);
      }
    };

    loadAdditionalUser();
  }, [userProfile]);

  const handleUserSwitch = (userId: string) => {
    setActiveUserId(userId);
  };

  const handleAddSpouse = async (spouseData: any) => {
    try {
      const { data, error } = await db.createUserForSpouse(spouseData);
      if (error) {
        throw error;
      }

      if (data) {
        setAdditionalUser(data);
        // You might also want to create a couple relationship here
      }
    } catch (error) {
      console.error('Error adding spouse:', error);
    }
  };

  const handleRemoveSpouse = async () => {
    // Implementation for removing spouse
    setAdditionalUser(null);
  };

  const handleUpdateUser = async (updates: any) => {
    if (!activeUserId) return;

    try {
      const { data, error } = await db.updateUser(activeUserId, updates);
      if (error) {
        throw error;
      }

      // Refresh user profile if updating the primary user
      if (activeUserId === userProfile?.id) {
        // You might want to refresh the auth context here
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getActiveUser = (): User | undefined => {
    if (!activeUserId) return userProfile || undefined;
    
    if (activeUserId === userProfile?.id) {
      return userProfile;
    }
    
    if (activeUserId === additionalUser?.id) {
      return additionalUser;
    }
    
    return userProfile || undefined;
  };

  const activeUser = getActiveUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          {isLoginMode ? (
            <LoginForm onToggleMode={() => setIsLoginMode(false)} />
          ) : (
            <SignUpForm onToggleMode={() => setIsLoginMode(true)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Canadian Investment Tracker</h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home size={16} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'settings'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </nav>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <UserIcon size={16} />
                <span>{activeUser?.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
                      Signed in as {userProfile.name}
                    </div>
                    
                    {additionalUser && (
                      <>
                        <button
                          onClick={() => {
                            handleUserSwitch(userProfile.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            activeUserId === userProfile.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <UserIcon size={16} />
                            <span>{userProfile.name}</span>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Primary</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleUserSwitch(additionalUser.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            activeUserId === additionalUser.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <UserIcon size={16} />
                            <span>{additionalUser.name}</span>
                          </div>
                        </button>
                        
                        <div className="border-t border-gray-200"></div>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard
            activeUser={activeUser}
            couplePartner={additionalUser || undefined}
            primaryUser={userProfile}
            additionalUser={additionalUser || undefined}
            onUserSwitch={handleUserSwitch}
          />
        ) : (
          <SettingsPage
            activeUser={activeUser}
            couplePartner={additionalUser || undefined}
            primaryUser={userProfile}
            additionalUser={additionalUser || undefined}
            onSignOut={signOut}
            onUpdateUser={handleUpdateUser}
            onAddSpouse={handleAddSpouse}
            onRemoveSpouse={handleRemoveSpouse}
          />
        )}
      </main>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;