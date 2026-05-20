"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCog, Plus, Search, Mail, Key, Eye, EyeOff, 
  Trash2, Edit, X, ShieldAlert, Check, Loader2, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF_MANAGER";
  createdAt: string;
};

type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
} | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ADMIN" as "SUPER_ADMIN" | "ADMIN" | "STAFF_MANAGER",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch active login session", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode("CREATE");
    setSelectedUserId(null);
    setFormData({
      name: "",
      email: "",
      role: "ADMIN",
      password: "",
    });
    setFormError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setModalMode("EDIT");
    setSelectedUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "", // Optional password update
    });
    setFormError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required fields.");
      return;
    }

    if (modalMode === "CREATE" && !formData.password) {
      setFormError("Password is required for new user profiles.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitLoading(true);
    try {
      const url = modalMode === "CREATE" ? "/api/admin/users" : `/api/admin/users/${selectedUserId}`;
      const method = modalMode === "CREATE" ? "POST" : "PUT";
      
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsModalOpen(false);
        fetchUsers();
        // If editing self, refresh auth details
        if (selectedUserId === currentUser?.id) {
          fetchCurrentUser();
        }
      } else {
        setFormError(data.error || "An error occurred during submission.");
      }
    } catch (error) {
      setFormError("Failed to connect to backend server. Try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      alert("Self-deletion blocked. You cannot delete your own logged-in user profile!");
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete the admin user profile for "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete user profile.");
      }
    } catch (error) {
      alert("Connection failure while deleting profile.");
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "ADMIN":
        return "bg-[#799A29]/10 text-[#799A29] border-[#799A29]/20";
      case "STAFF_MANAGER":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "ADMIN": return "Admin";
      case "STAFF_MANAGER": return "Staff Manager";
      default: return role;
    }
  };

  // Filtered list
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-dark flex items-center gap-2">
            <UserCog className="text-[#799A29]" size={26} />
            User Management
          </h1>
          <p className="text-gray-500 text-sm">
            Create, update, and manage administrative user accounts and system credentials.
          </p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer border-none"
        >
          <Plus size={16} />
          Add New User
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Total Users: {users.length}
        </div>
      </div>

      {/* USERS DATA GRID */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
            <span className="animate-spin w-8 h-8 border-3 border-[#799A29] border-t-transparent rounded-full" />
            <p className="text-xs">Loading admin user database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-gray-400 space-y-2">
            <UserCog className="mx-auto text-gray-200" size={48} />
            <p className="text-sm font-semibold">No admin users found</p>
            <p className="text-xs text-gray-400">Try adjusting your search filters or add a new team profile.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Created On</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-dark font-medium">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-dark">{user.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-bold bg-[#799A29]/10 text-[#799A29] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEditModal(user)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-xl transition-all duration-200"
                            title="Edit User Profile / Password"
                          >
                            <Edit size={18} />
                          </button>
                          {currentUser?.role !== "STAFF_MANAGER" && (
                            <button 
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className={`p-2 rounded-xl transition-all duration-200 ${
                                isSelf 
                                  ? "text-gray-200 cursor-not-allowed" 
                                  : "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                              title={isSelf ? "Self-deletion disabled" : "Delete User Profile"}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Backdrop Dismiss Overlay */}
            <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              
              {/* Header */}
              <div className="bg-[#799A29] p-6 text-white flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-serif text-white">
                    {modalMode === "CREATE" ? "Add New User Profile" : "Edit User Profile"}
                  </h2>
                  <p className="text-white/80 text-xs">
                    {modalMode === "CREATE" 
                      ? "Create credentials and roles for staff access." 
                      : "Modify profile details or reset security credentials."}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer border-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-6">
                
                {/* Form Errors Banner */}
                {formError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-start gap-2.5">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Input Fields */}
                <div className="space-y-4">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5">Full Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary transition-colors bg-white text-dark font-medium"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email"
                        placeholder="e.g. jdoe@carefirst.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary transition-colors bg-white text-dark font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Role Select */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5">System Access Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white text-dark font-semibold cursor-pointer"
                    >
                      <option value="ADMIN">Admin (Standard Dashboard Access)</option>
                      <option value="STAFF_MANAGER">Staff Manager (Schedule Coordination)</option>
                      <option value="SUPER_ADMIN">Super Admin (Global System Control)</option>
                    </select>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-400 mb-1.5">
                      {modalMode === "CREATE" ? "Account Password" : "Change Password"}
                    </label>
                    <div className="relative">
                      <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        placeholder={modalMode === "CREATE" ? "••••••••" : "Leave blank to keep current"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary transition-colors bg-white text-dark font-medium"
                        required={modalMode === "CREATE"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 border-none bg-transparent cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {modalMode === "EDIT" && (
                      <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                        To leave the password unchanged, keep this field completely empty.
                      </p>
                    )}
                  </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="btn-primary px-6 py-2.5 text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-none"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        {modalMode === "CREATE" ? "Create Account" : "Save Changes"}
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
