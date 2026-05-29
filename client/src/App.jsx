import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCars from './pages/admin/ManageCars';
import ManageSlabs from './pages/admin/ManageSlabs';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import SalesEntry from './pages/officer/SalesEntry';
import Calculator from './pages/officer/Calculator';
import History from './pages/officer/History';
import Profile from './pages/officer/Profile';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/officer'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="cars" element={<ManageCars />} />
        <Route path="slabs" element={<ManageSlabs />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route
        path="/officer"
        element={
          <ProtectedRoute role="sales_officer">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OfficerDashboard />} />
        <Route path="sales" element={<SalesEntry />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
