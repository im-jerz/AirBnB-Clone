import { Navigate, useLocation } from "react-router-dom";

/**
 * Guards any nested route behind a valid access token.
 * Tokens are written to localStorage by api/auth.js's login() on
 * success, and cleared by logout() / the axios refresh-failure path.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
}
