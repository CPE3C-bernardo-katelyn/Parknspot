import { useEffect, useState } from "react";
import { Search, Eye, Edit2, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import AdminLayout from "./AdminLayout";

// DELETE this line:
const API_URL = import.meta.env.VITE_ADMIN_API_URL;

type User = {
  _id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: string;
  lastActivity?: string;
  createdAt?: string;
};

function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 5;

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/users?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
        { headers }
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [currentPage, searchQuery]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`${ADMIN_API_URL}/api/users/${id}`, { method: 'DELETE', headers });
    fetchUsers();
  };

  const handleToggleStatus = async (id: string) => {
    await fetch(`${ADMIN_API_URL}/api/users/${id}/toggle-status`, { method: 'PATCH', headers });
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    await fetch(`${ADMIN_API_URL}/api/users/${editingUser._id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(editForm),
    });
    setEditingUser(null);
    fetchUsers();
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <AdminLayout title="Users">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 bg-surface overflow-x-hidden">
        <div className="mb-6 lg:mb-10 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="w-full min-w-0">
            <h1 className="text-2xl lg:text-4xl font-extrabold text-on-surface leading-tight break-words">Access Registry</h1>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
              <h2 className="text-xl font-bold mb-6">Edit User</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Name</label>
                  <input
                    required
                    className="w-full bg-surface-container-low border-none p-3 rounded-sm"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input
                    required
                    type="email"
                    className="w-full bg-surface-container-low border-none p-3 rounded-sm"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="text-sm font-bold px-4 py-2 border border-outline-variant/30 rounded-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-primary text-white px-6 py-2 rounded-sm font-bold">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {viewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
              <h2 className="text-xl font-bold mb-6">User Details</h2>
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-4">
                    {viewingUser.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{viewingUser.name}</p>
                    <p className="text-sm text-on-surface-variant">{viewingUser.email}</p>
                    <p className="text-xs mt-1 font-bold uppercase">{viewingUser.role}</p>
                  </div>
                </div>
                <div className="p-3 bg-surface-container-low rounded text-center">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Status</p>
                  <p className="font-bold">{viewingUser.status}</p>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setViewingUser(null)}
                  className="bg-primary text-white px-8 py-2 rounded-sm font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 flex justify-start">
          <div className="w-full max-w-md flex items-center bg-surface-container-low p-1 rounded-sm border border-outline-variant/30 overflow-hidden">
            <Search className="px-3 text-on-surface-variant w-10 shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-sm py-2 text-on-surface placeholder:text-on-surface-variant/60 min-w-0"
              placeholder="Search registry..."
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-low rounded-lg overflow-hidden shadow">
          <div className="overflow-x-auto pb-4">
            {loading ? (
              <div className="p-20 text-center">
                <p className="text-on-surface-variant animate-pulse font-bold uppercase tracking-widest text-sm">
                  Loading users...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-on-surface-variant font-bold text-sm">No users found.</p>
                <p className="text-xs text-on-surface-variant/60 mt-2">
                  Make sure the Admin backend is running on port 5001.
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-on-surface-variant font-medium italic">No users found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant">
                    <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest">Name</th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-widest text-center">Status</th>
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-widest">Joined</th>
                    <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {users.map((user) => (
                    <tr key={user._id} className="group hover:bg-surface-container-lowest transition-colors">
                      <td className="py-6 px-8">
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-10 h-10 rounded-sm flex items-center justify-center font-bold text-sm shrink-0",
                            user.status === 'ACTIVE'
                              ? "bg-primary-container text-white"
                              : "bg-surface-container-highest text-on-surface-variant"
                          )}>
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface text-sm truncate">{user.name}</p>
                            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          user.status === 'ACTIVE'
                            ? "bg-[#e8f5e9] text-[#2e7d32]"
                            : "bg-[#eeeeee] text-[#757575]"
                        )}>
                          <span className={cn(
                            "w-1 h-1 rounded-full mr-1.5",
                            user.status === 'ACTIVE' ? "bg-[#2e7d32]" : "bg-[#757575]"
                          )} />
                          {user.status}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <p className="text-xs text-on-surface-variant">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20 rounded-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20 rounded-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors border border-outline-variant/20 rounded-sm"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors border border-outline-variant/20 rounded-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="py-5 px-8 flex justify-between items-center bg-surface-container-low border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant font-medium">
              Showing {total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} Users
            </p>
            <div className="flex space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-sm bg-surface-container-highest text-on-surface-variant disabled:opacity-50 border border-outline-variant/30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "px-3.5 py-2 rounded-sm text-xs font-bold border",
                    currentPage === i + 1
                      ? "bg-primary text-white border-primary"
                      : "bg-surface-container-highest text-on-surface-variant border-outline-variant/30"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-sm bg-surface-container-highest text-on-surface-variant disabled:opacity-50 border border-outline-variant/30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}

export default UsersScreen;