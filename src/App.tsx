import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
// import { usePaymentStore } from './store/paymentStore';

// Layouts
import Navbar from './components/layout/Navbar';
import { AppRoutes } from './routes';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PaymentsPage from './pages/PaymentsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ExportPage from './pages/ExportPage';
import NewPaymentPage from './pages/NewPaymentPage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import EditPaymentPage from './pages/EditPaymentPage';
import FileViewerPage from './pages/FileViewerPage';

// CMS Pages
import Home from './pages/cms/home';
import UsersPage from './pages/cms/users';
import CategoriesPage from './pages/cms/categories';
import SubcategoriesPage from './pages/cms/subcategories';
import VendorsPage from './pages/cms/vendors';
import CompaniesPage from './pages/cms/companies';
import BranchesPage from './pages/cms/branches';
import VerificationPage from './pages/VerificationsPage';

// Route protection component
const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user doesn't have required role, redirect to dashboard
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
