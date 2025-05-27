import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Target, MessageCircle, BarChart3, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <Target size={20} />,
      show: !isAdmin,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={20} />,
      show: !isAdmin,
    },
    {
      id: 'chat',
      label: isAdmin ? 'Support Chat' : 'Chat with Advisor',
      icon: <MessageCircle size={20} />,
      show: true,
    },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
    }
  };

  return (
    <nav className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Target className="h-8 w-8 mr-2" />
              <div>
                <span className="text-xl font-bold">FINTRACT</span>
                <p className="text-xs text-teal-100">Tomorrow Starts Today</p>
              </div>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {tabs.map((tab) => (
                tab.show && (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      activeTab === tab.id
                        ? 'bg-teal-800 text-white'
                        : 'text-teal-100 hover:bg-teal-500'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <div className="hidden md:block">
                  <span className="text-sm font-medium">
                    {isAdmin ? '👑 Financial Advisor' : currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-teal-100 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                  <span className="ml-2 hidden md:inline">Logout</span>
                </button>
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-teal-100 hover:text-white hover:bg-teal-500 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {tabs.map((tab) => (
              tab.show && (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === tab.id
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-500'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              )
            ))}
            
            {currentUser && (
              <div className="px-3 py-2 text-teal-100">
                <span className="text-sm font-medium block mb-2">
                  {isAdmin ? '👑 Financial Advisor' : currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-teal-100 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                  <span className="ml-2">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;