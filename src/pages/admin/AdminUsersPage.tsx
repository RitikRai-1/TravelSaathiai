import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, Shield, ShieldCheck, UserCheck, RefreshCw, Filter, CheckCircle2, XCircle } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.updateAdminUser(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUpdatingId(userId);
    try {
      await api.updateAdminUser(userId, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'CONTENT_MANAGER':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'BUSINESS_MODERATOR':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'BUSINESS_OWNER':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">User Accounts Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage tourists, business owners, and administrative privileges
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="TOURIST">Tourists</option>
            <option value="BUSINESS_OWNER">Business Owners</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="CONTENT_MANAGER">Content Managers</option>
            <option value="BUSINESS_MODERATOR">Business Moderators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading user directory...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No users match your criteria</p>
        </div>
      ) : (
        <>
          {/* Mobile Users Cards (<= 767px) */}
          <div className="block md:hidden space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{u.name}</h3>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                      u.role
                    )}`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>{u.phone || 'No phone'} {u.location ? `• ${u.location}` : ''}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {u.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <select
                    disabled={updatingId === u.id || u.role === 'SUPER_ADMIN'}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 disabled:opacity-50 min-h-[44px]"
                  >
                    <option value="TOURIST">Tourist</option>
                    <option value="BUSINESS_OWNER">Business Owner</option>
                    <option value="BUSINESS_MODERATOR">Business Moderator</option>
                    <option value="CONTENT_MANAGER">Content Manager</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>

                  {u.role !== 'SUPER_ADMIN' && (
                    <button
                      disabled={updatingId === u.id}
                      onClick={() => handleStatusToggle(u.id, u.status || 'ACTIVE')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition min-h-[44px] flex items-center justify-center ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) - 100% Preserved */}
          <div className="hidden md:block bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Phone / City</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Change Role</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{u.phone || '—'}</div>
                      <div className="text-[10px] text-slate-500">{u.location || ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        disabled={updatingId === u.id || u.role === 'SUPER_ADMIN'}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                      >
                        <option value="TOURIST">Tourist</option>
                        <option value="BUSINESS_OWNER">Business Owner</option>
                        <option value="BUSINESS_MODERATOR">Business Moderator</option>
                        <option value="CONTENT_MANAGER">Content Manager</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          disabled={updatingId === u.id}
                          onClick={() => handleStatusToggle(u.id, u.status || 'ACTIVE')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}
    </div>
  );
};
