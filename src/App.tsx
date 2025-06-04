import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Authentication
import LoginPage from './pages/auth/LoginPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ReviewFormPage from './pages/review-forms/ReviewFormPage';
import CreateFormPage from './pages/review-forms/CreateFormPage';
import CampaignsPage from './pages/campaigns/CampaignsPage';
import CreateCampaignPage from './pages/campaigns/CreateCampaignPage';
import GiftsPage from './pages/gifts/GiftsPage';
import CreateGiftPage from './pages/gifts/CreateGiftPage';
import CustomersPage from './pages/customers/CustomersPage';
import ConnectionsPage from './pages/connections/ConnectionsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect to dashboard if already authenticated and trying to access login
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard\" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        
        <Route path="review-forms">
          <Route index element={<ReviewFormPage />} />
          <Route path="create" element={<CreateFormPage />} />
          <Route path="edit/:id" element={<CreateFormPage />} />
        </Route>
        
        <Route path="campaigns">
          <Route index element={<CampaignsPage />} />
          <Route path="create" element={<CreateCampaignPage />} />
          <Route path="edit/:id" element={<CreateCampaignPage />} />
        </Route>
        
        <Route path="gifts">
          <Route index element={<GiftsPage />} />
          <Route path="create" element={<CreateGiftPage />} />
          <Route path="edit/:id" element={<CreateGiftPage />} />
        </Route>
        
        <Route path="customers" element={<CustomersPage />} />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;