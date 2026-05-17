import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import Transactions from './components/transactions/Transactions';
import Analytics from './components/analytics/Analytics';
import Categories from './components/categories/Categories';
import Subscription from './components/subscription/Subscription';
import Profile from './components/profile/Profile';
import Monitoring from './components/monitoring/Monitoring';
import UserAccess from './components/admin/UserAccess';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return isAdmin ? children : <Navigate to="/dashboard" />;
};

const PageRoute = ({ page, children }) => {
  const { canAccessPage, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return canAccessPage(page) ? children : <Navigate to="/dashboard" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<PageRoute page="dashboard"><Dashboard /></PageRoute>} />
              <Route path="transactions" element={<PageRoute page="transactions"><Transactions /></PageRoute>} />
              <Route path="analytics" element={<PageRoute page="analytics"><Analytics /></PageRoute>} />
              <Route path="categories" element={<PageRoute page="categories"><Categories /></PageRoute>} />
              <Route path="subscription" element={<PageRoute page="subscription"><Subscription /></PageRoute>} />
              <Route path="profile" element={<PageRoute page="profile"><Profile /></PageRoute>} />
              <Route path="monitoring" element={
                <AdminRoute>
                  <Monitoring />
                </AdminRoute>
              } />
              <Route path="access" element={
                <AdminRoute>
                  <UserAccess />
                </AdminRoute>
              } />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
