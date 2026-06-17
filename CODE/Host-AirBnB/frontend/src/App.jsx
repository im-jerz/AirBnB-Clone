import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import VerifyEmail from './pages/auth/VerifyEmail'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import { ToastProvider } from './components/common/Toast'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './pages/DashboardHome'
import PropertyManagement from './pages/properties/PropertyManagement'
import AddEditProperty from './pages/properties/AddEditProperty'

/**
 * Maps the `onNavigate(page, params)` calls used inside the auth pages
 * to real React Router navigation. `params` (e.g. { email }) is passed
 * along as route state so the destination page can read it.
 */
function AuthRoutes() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigate = (page, params = {}) => {
    navigate(`/${page}`, { state: params })
  }

  const state = location.state || {}

  return (
    <Routes>
      <Route path="/signin" element={<SignIn onNavigate={handleNavigate} />} />
      <Route path="/signup" element={<SignUp onNavigate={handleNavigate} />} />
      <Route
        path="/verify-email"
        element={<VerifyEmail onNavigate={handleNavigate} email={state.email || "you@example.com"} />}
      />
      <Route path="/forgot-password" element={<ForgotPassword onNavigate={handleNavigate} />} />
      <Route
        path="/reset-password"
        element={<ResetPassword onNavigate={handleNavigate} email={state.email || ""} />}
      />

      {/* Default route */}
      <Route path="/" element={<Navigate to="/signin" replace />} />

      {/* Dashboard routes (protected later — no session gate yet per current phase) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="properties" element={<PropertyManagement />} />
        <Route path="properties/new" element={<AddEditProperty />} />
        <Route path="properties/:id/edit" element={<AddEditProperty />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthRoutes />
      </ToastProvider>
    </Router>
  )
}

export default App
