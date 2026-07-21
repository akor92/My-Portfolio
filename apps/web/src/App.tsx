import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage.js';
import { PostPage } from './pages/PostPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { DashboardPage } from './pages/admin/DashboardPage.js';
import { ProjectsAdmin } from './pages/admin/ProjectsAdmin.js';
import { PostsAdmin } from './pages/admin/PostsAdmin.js';
import { MessagesAdmin } from './pages/admin/MessagesAdmin.js';
import { RequireAuth } from './components/RequireAuth.js';

export function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<HomePage />} />
      <Route path="/blog/:slug" element={<PostPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin (protected) */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="posts" element={<PostsAdmin />} />
        <Route path="messages" element={<MessagesAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
