import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/Layout';
import Dashboard from '../components/admin/Dashboard';
import AdminProjects from '../components/admin/Projects';
import SkillsManager from '../components/admin/Skills';
import MessagesManager from '../components/admin/Messages';
import ProfileEditor from '../components/admin/ProfileEditor';
import SettingsPage from '../components/admin/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const Admin = () => {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="skills" element={<SkillsManager />} />
        <Route path="messages" element={<MessagesManager />} />
        <Route path="profile" element={<ProfileEditor />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default Admin;