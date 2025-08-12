import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Suspense } from "react";
import ErrorBoundary from "../utils/ErrorBoundary";

const ProtectedRoute = ({ children }) => {
  const { userData, loading: authLoading } = useAuth(); // assuming your hook supports this

  // 1. Show loader while checking auth
  if (authLoading) {
    return <div>Checking authentication...</div>;
  }

  // 2. Redirect if not logged in
  if (!userData) {
    console.warn("Unauthorized access attempt — redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // 3. Render protected content inside ErrorBoundary + Suspense
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading protected content...</div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default ProtectedRoute;
