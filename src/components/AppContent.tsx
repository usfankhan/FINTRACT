import React, { useState } from 'react';
import Navbar from './Navbar';
import ExpensesPage from '../pages/ExpensesPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ChatPage from '../pages/ChatPage';
import { useAuth } from '../context/AuthContext';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="py-6">
        {activeTab === 'expenses' && <ExpensesPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {(activeTab === 'chat' || isAdmin) && <ChatPage />}
      </main>
    </div>
  );
};

export default AppContent;