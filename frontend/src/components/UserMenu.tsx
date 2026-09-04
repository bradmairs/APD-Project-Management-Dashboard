import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-600">
        {user.name}
        {user.role === "ADMIN" && (
          <span className="ml-1.5 text-xs text-blue-600 font-medium">Admin</span>
        )}
      </span>
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
      >
        Log out
      </button>
    </div>
  );
}
