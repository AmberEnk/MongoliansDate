import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function MinePage() {
  const { loggedIn, ready, user } = useAuth();
  if (!ready) return null;
  if (!loggedIn || !user) return <Navigate to="/login" replace />;
  return <Navigate to={`/u/${user.id}`} replace />;
}
