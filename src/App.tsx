import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import Events from './pages/Events';
import Posts from './pages/Posts';
import Leadership from './pages/Leadership';
import Gallery from './pages/Gallery';
import Messages from './pages/Messages';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="posts" element={<Posts />} />
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