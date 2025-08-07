import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Suspense } from "react";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;
