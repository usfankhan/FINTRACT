import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { ChatProvider } from './context/ChatContext';
import AppContent from './components/AppContent';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';

function AppWrapper() {
  const { currentUser } = useAuth();

  return currentUser ? <AppContent /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <ChatProvider>
          <AppWrapper />
        </ChatProvider>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;