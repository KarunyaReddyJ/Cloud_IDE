import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Suspense } from "react";

const ProtectedRoute = ({ children }) => {
  const { userData } = useAuth();

  if (!userData){
    console.log('userDe')
     return <Navigate to="/login" />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
};

export default ProtectedRoute;
