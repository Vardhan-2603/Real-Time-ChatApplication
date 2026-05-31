import { Navigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

export default function GuestRoute({ children }) {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/chat" />;
  }

  return children;
}
