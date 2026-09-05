import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ChangePasswordModal from "./ChangePasswordModal";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <ThemeToggle />
      <NotificationBell />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
        >
          {user.name}
          {user.role === "ADMIN" && (
            <span className="ml-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              Admin
            </span>
          )}
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-lg z-20 py-1">
              <button
                onClick={() => {
                  setShowPasswordModal(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Change Password
              </button>
              {user.role === "ADMIN" && (
                <Link
                  to="/admin/users"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Manage Users
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        Log out
      </button>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
