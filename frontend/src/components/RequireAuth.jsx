import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#757873]">
        Memuat...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
