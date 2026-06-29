import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AssistantChatbot from './components/AssistantChatbot';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import PropertyDetail from './pages/PropertyDetail';
import Dashboard from './pages/Dashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import Chat from './pages/Chat';
import VirtualTour from './pages/VirtualTour';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/virtual-tour/:id" element={<VirtualTour />} />
              <Route path="/dashboard" element={<ProtectedRoute role="customer"><Dashboard /></ProtectedRoute>} />
              <Route path="/landlord/dashboard" element={<ProtectedRoute role="landlord"><LandlordDashboard /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/messages/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <AssistantChatbot />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
