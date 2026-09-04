import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createUser, getUsers, setUserActive, updateUserRole } from "../api";
import { Role, User } from "../types";
import { formatDate } from "../format";
import { useAuth } from "../auth/AuthContext";
import CreateUserModal from "../components/CreateUserModal";
import UserMenu from "../components/UserMenu";
import gvwLogo from "../assets/gvw-logo.png";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(user: User, role: Role) {
    try {
      await updateUserRole(user.id, role);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function handleActiveToggle(user: User) {
    try {
      await setUserActive(user.id, !user.active);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update account status"
      );
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            ← Back to dashboard
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <img src={gvwLogo} alt="Goulburn Valley Water" className="h-14 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Users</h1>
                <p className="text-sm text-slate-500">Manage team accounts and roles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + New User
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded p-3 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 py-12">Loading…</div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Joined
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className={user.active ? "" : "bg-slate-50"}>
                    <td
                      className={`px-4 py-3 font-medium ${
                        user.active ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-slate-400">(you)</span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        user.active ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        disabled={user.id === currentUser?.id || !user.active}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value as Role)
                        }
                        className="text-sm rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {user.active ? (
                        <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        user.active ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleActiveToggle(user)}
                        disabled={user.id === currentUser?.id}
                        title={
                          user.id === currentUser?.id
                            ? "You can't deactivate your own account"
                            : undefined
                        }
                        className={`text-xs hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed ${
                          user.active ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        {user.active ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            const user = await createUser(data);
            await load();
            return user;
          }}
        />
      )}
    </div>
  );
}
