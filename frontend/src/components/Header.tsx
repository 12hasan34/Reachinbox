import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "./Button";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">ReachInbox</h2>
        <div className="text-xs text-gray-500">Email Scheduler Dashboard</div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.email}</span>
        <Button variant="secondary" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}