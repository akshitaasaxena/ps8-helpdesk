import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerTicketList from './pages/CustomerTicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import EditTicket from './pages/EditTicket';
import AdminTicketList from './pages/AdminTicketList';
import AdminDepartments from './pages/AdminDepartments';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './App.css';
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/tickets" replace />;
};
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><CustomerTicketList /></ProtectedRoute>} />
              <Route path="/tickets/new" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
              <Route path="/tickets/:id/edit" element={<ProtectedRoute><EditTicket /></ProtectedRoute>} />
              <Route path="/admin/tickets" element={<ProtectedRoute requiredRole="admin"><AdminTicketList /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute requiredRole="admin"><AdminDepartments /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;
