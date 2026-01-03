import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Header from './components/Header';
import DriverDatabase from './pages/Admin/DriverDatabase'; 
import RoleSelect from './pages/RoleSelect';

// Driver Pages
import DriverSignup from './pages/Driver/Signup';
import DriverLogin from './pages/Driver/Login';
import DriverDashboard from './pages/Driver/Dashboard';
import DriverSubmitForm from './pages/Driver/SubmitForm';

// Officer Pages
import OfficerLogin from './pages/Officer/Login';
import OfficerDashboard from './pages/Officer/Dashboard';

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageUsers from './pages/Admin/ManageUsers';

// Station Pages
import StationLogin from './pages/Station/Login';
import StationDashboard from './pages/Station/Dashboard';

import { AuthProvider } from './api/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header /> {/* Universal header included here */}

        <Routes>
          <Route path="/" element={<RoleSelect />} />

          {/* Driver */}
          <Route path="/driver/signup" element={<DriverSignup />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute roles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/submit"
            element={
              <ProtectedRoute roles={['driver']}>
                <DriverSubmitForm />
              </ProtectedRoute>
            }
          />

          {/* Officer */}
          <Route path="/officer/login" element={<OfficerLogin />} />
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute roles={['officer']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute roles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          {/* Station */}
          <Route path="/station/login" element={<StationLogin />} />
          <Route
            path="/station/dashboard"
            element={
              <ProtectedRoute roles={['station']}>
                <StationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/driver-database"
  element={
    <ProtectedRoute roles={['admin']}>
      <DriverDatabase />
    </ProtectedRoute>
  }
/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
//Aashutosh Kushwaha ,IIT KANPUR