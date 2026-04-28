import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import SignUp from './pages/Login/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import Checklists from './pages/Checklists/Checklists';
import Execute from './pages/Execute/Execute';
import History from './pages/History/History';
import Ranking from './pages/Ranking/Ranking';
import Alerts from './pages/Alerts/Alerts';
import Users from './pages/Users/Users';

function PrivateRoute({ children, minRole }) {
  const { user, loading } = useAuth();
  const roleLevel = { STAFF: 1, MANAGER: 2, ADMIN: 3 };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (minRole && roleLevel[user.role] < roleLevel[minRole]) {
    return <Navigate to="/executar" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'STAFF' ? '/executar' : '/dashboard'} replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'STAFF' ? '/executar' : '/dashboard'} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'STAFF' ? '/executar' : '/dashboard'} replace /> : <SignUp />} />

      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<PrivateRoute minRole="MANAGER"><Dashboard /></PrivateRoute>} />
        <Route path="/checklists" element={<PrivateRoute minRole="MANAGER"><Checklists /></PrivateRoute>} />
        <Route path="/executar" element={<Execute />} />
        <Route path="/historico" element={<History />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/alertas" element={<PrivateRoute minRole="MANAGER"><Alerts /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute minRole="ADMIN"><Users /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
