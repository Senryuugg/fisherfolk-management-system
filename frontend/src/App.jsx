'use client';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FisherfolkList from './pages/FisherfolkList';
import BoatsGears from './pages/BoatsGears';
import Report from './pages/Report';
import Organization from './pages/Organization';
import OrdinanceResolution from './pages/OrdinanceResolution';
import LevelsOfDevelopment from './pages/LevelsOfDevelopment';
import Maps from './pages/Maps';
import HelpDesk from './pages/HelpDesk';
import ManageAccount from './pages/ManageAccount';
import FAQs from './pages/FAQs';
import './styles/Global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fisherfolk-list"
            element={
              <ProtectedRoute>
                <FisherfolkList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boats-gears"
            element={
              <ProtectedRoute>
                <BoatsGears />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organization"
            element={
              <ProtectedRoute>
                <Organization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordinance"
            element={
              <ProtectedRoute>
                <OrdinanceResolution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/levels"
            element={
              <ProtectedRoute>
                <LevelsOfDevelopment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maps"
            element={
              <ProtectedRoute>
                <Maps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help-desk"
            element={
              <ProtectedRoute>
                <HelpDesk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-account"
            element={
              <ProtectedRoute>
                <ManageAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faqs"
            element={
              <ProtectedRoute>
                <FAQs />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
