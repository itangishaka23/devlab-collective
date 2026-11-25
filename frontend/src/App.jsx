import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Account from './pages/Account.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Events from './pages/Events.jsx';
import Faq from './pages/Faq.jsx';
import Gallery from './pages/Gallery.jsx';
import Hosted from './pages/Hosted.jsx';
import Home from './pages/Home.jsx';
import Join from './pages/Join.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import PolicyPage from './pages/PolicyPage.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Register from './pages/Register.jsx';
import Reports from './pages/Reports.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import {
  ApplicationsAdmin, CommentsAdmin, EventsAdmin, FaqsAdmin, GalleryAdmin, HostedAdmin, MembersAdmin, MessagesAdmin,
  PostsAdmin, ProjectsAdmin, ReportsAdmin, SubscribersAdmin, TeamAdmin,
} from './pages/admin/screens.jsx';
import { PRIVACY, TERMS } from './data/policies.js';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="projects" element={<Navigate to="/#projects" replace />} />
        <Route path="events" element={<Events />} />
        <Route path="hosted" element={<Hosted />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="faq" element={<Faq />} />
        <Route path="reports" element={<Reports />} />
        <Route path="join" element={<Join />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="privacy" element={<PolicyPage doc={PRIVACY} />} />
        <Route path="terms" element={<PolicyPage doc={TERMS} />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin dashboard (own layout, admin only) */}
      <Route path="admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="applications" element={<ApplicationsAdmin />} />
        <Route path="messages" element={<MessagesAdmin />} />
        <Route path="subscribers" element={<SubscribersAdmin />} />
        <Route path="projects" element={<ProjectsAdmin />} />
        <Route path="hosted" element={<HostedAdmin />} />
        <Route path="posts" element={<PostsAdmin />} />
        <Route path="comments" element={<CommentsAdmin />} />
        <Route path="events" element={<EventsAdmin />} />
        <Route path="faqs" element={<FaqsAdmin />} />
        <Route path="team" element={<TeamAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="reports" element={<ReportsAdmin />} />
        <Route path="members" element={<MembersAdmin />} />
      </Route>
    </Routes>
  );
}
