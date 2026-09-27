import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import Events from './pages/Events';
import Leadership from './pages/Leadership';
import Gallery from './pages/Gallery';
import Messages from './pages/Messages';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
// Posts module
import PostsList from './pages/posts/PostsList';
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="events" element={<Events />} />
            {/* Posts module — full sub-routes */}
            <Route path="posts" element={<PostsList />} />
            <Route path="posts/new" element={<CreatePost />} />
            <Route path="posts/:id/edit" element={<EditPost />} />
            {/* Other modules */}
            <Route path="leadership" element={<Leadership />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;