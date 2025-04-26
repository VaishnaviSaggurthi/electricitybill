import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import BillGenerationPage from './pages/BillGenerationPage';
import BillHistoryPage from './pages/BillHistoryPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import DueReminder from './components/DueReminder';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { checkAndGenerateMonthlyBills } from './utils/billUtils';

function App() {
  useEffect(() => {
    // Check for monthly bills on app load
    checkAndGenerateMonthlyBills();
    
    // Set up interval to check for monthly bills (every 24 hours)
    const interval = setInterval(checkAndGenerateMonthlyBills, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <SonnerToaster position="top-right" expand richColors closeButton />
        <DueReminder />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="generate-bill" element={<BillGenerationPage />} />
            <Route path="bill-history" element={<BillHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;