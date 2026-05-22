"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Search, CheckCircle2, XCircle,
  User, Phone, Mail, Building2, Briefcase, AlertCircle,
  RefreshCw, Save, X, ToggleLeft, ToggleRight, FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────
type Worker = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  role: string | null;
  organisation: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
};

const EMPTY_FORM = {
  name: "", phoneNumber: "", email: "",
  role: "", organisation: "", notes: "",
};

// ─── Main ──────────────────────────────────────────────────────────────────
export default function SupportWorkersPage() {
  const [workers, setWorkers]       = useState<Worker[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Worker | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/support-workers?all=true");
      if (!res.ok) throw new Error("Failed to load support workers");
      setWorkers(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWorkers(); }, [fetchWorkers]);

  // ── Flash message helper ───────────────────────────────────────────────
  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  // ── Open modal ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditWorker(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (w: Worker) => {
    setEditWorker(w);
    setForm({
      name: w.name, phoneNumber: w.phoneNumber,
      email: w.email ?? "", role: w.role ?? "",
      organisation: w.organisation ?? "", notes: w.notes ?? "",
    });
    setShowModal(true);
  };

  // ── Save (create or update) ────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phoneNumber.trim()) {
      setError("Name and phone number are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url    = editWorker ? `/api/support-workers/${editWorker.id}` : "/api/support-workers";
      const method = editWorker ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setShowModal(false);
      await fetchWorkers();
      flash(editWorker ? "Support worker updated." : "Support worker created successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────────────
  const toggleActive = async (w: Worker) => {
    try {
      const res = await fetch(`/api/support-workers/${w.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !w.isActive }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setWorkers((prev) => prev.map((x) => x.id === w.id ? { ...x, isActive: !x.isActive } : x));
      flash(`${w.name} marked as ${!w.isActive ? "Active" : "Inactive"}.`);
    } catch {
      setError("Failed to toggle status.");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/support-workers/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setWorkers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      flash(`${deleteTarget.name} has been removed.`);
    } catch {
      setError("Failed to delete support worker.");
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = workers.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      (w.role ?? "").toLowerCase().includes(q) ||
      (w.organisation ?? "").toLowerCase().includes(q) ||
      w.phoneNumber.includes(q)
    );
  });

  const active   = filtered.filter((w) => w.isActive);
  const inactive = filtered.filter((w) => !w.isActive);

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Support Workers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the global roster of support workers available in the referral form.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkers}
            title="Refresh"
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-primary hover:border-primary/40 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all"
          >
            <Plus size={16} /> Add Support Worker
          </button>
        </div>
      </div>

      {/* Flash / Error banners */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700">
            <CheckCircle2 size={18} className="shrink-0" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Workers", value: workers.length, color: "text-dark" },
          { label: "Active",        value: workers.filter(w => w.isActive).length,  color: "text-emerald-600" },
          { label: "Inactive",      value: workers.filter(w => !w.isActive).length, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, organisation or phone…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none bg-white"
        />
      </div>

      {/* Workers Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <User size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No support workers found.</p>
          <button onClick={openCreate} className="mt-4 text-sm text-primary font-semibold hover:underline">
            + Add your first support worker
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Active Workers */}
          {active.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Active Workers ({active.length})
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        <th className="px-5 py-3 font-semibold">Name</th>
                        <th className="px-5 py-3 font-semibold">Role / Organisation</th>
                        <th className="px-5 py-3 font-semibold">Contact</th>
                        <th className="px-5 py-3 font-semibold text-center">Status</th>
                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {active.map((w) => <WorkerRow key={w.id} worker={w} onEdit={openEdit} onToggle={toggleActive} onDelete={setDeleteTarget} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inactive Workers */}
          {inactive.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                Inactive Workers ({inactive.length})
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-70">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                        <th className="px-5 py-3 font-semibold">Name</th>
                        <th className="px-5 py-3 font-semibold">Role / Organisation</th>
                        <th className="px-5 py-3 font-semibold">Contact</th>
                        <th className="px-5 py-3 font-semibold text-center">Status</th>
                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inactive.map((w) => <WorkerRow key={w.id} worker={w} onEdit={openEdit} onToggle={toggleActive} onDelete={setDeleteTarget} />)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-dark transition-colors">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-dark text-lg">{editWorker ? "Edit Support Worker" : "Add Support Worker"}</h2>
                  <p className="text-xs text-gray-400">This worker will appear in the referral form for selection.</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Sarah Johnson"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="0400 000 000"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="worker@email.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Role / Title</label>
                    <div className="relative">
                      <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="e.g. Support Worker"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Organisation</label>
                    <div className="relative">
                      <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={form.organisation}
                        onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                        placeholder="e.g. My Care Solutions"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Internal Notes</label>
                    <div className="relative">
                      <FileText size={15} className="absolute left-3.5 top-3.5 text-gray-400" />
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Any internal notes about this worker…"
                        rows={2}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <Save size={15} />
                    {saving ? "Saving…" : editWorker ? "Save Changes" : "Create Worker"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-dark text-lg mb-2">Delete Support Worker?</h3>
              <p className="text-gray-500 text-sm mb-6">
                <strong className="text-dark">{deleteTarget.name}</strong> will be permanently removed from the roster and will no longer appear in the referral form.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all">
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Worker Table Row ────────────────────────────────────────────────────────
function WorkerRow({
  worker, onEdit, onToggle, onDelete,
}: {
  worker: Worker;
  onEdit: (w: Worker) => void;
  onToggle: (w: Worker) => void;
  onDelete: (w: Worker) => void;
}) {
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {worker.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-dark">{worker.name}</p>
            {worker.email && (
              <p className="text-xs text-gray-400 truncate max-w-[180px]">{worker.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-dark">{worker.role || <span className="text-gray-300 italic">—</span>}</p>
        <p className="text-xs text-gray-400">{worker.organisation || ""}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-dark flex items-center gap-1.5">
          <Phone size={13} className="text-gray-400" />
          {worker.phoneNumber}
        </p>
      </td>
      <td className="px-5 py-4 text-center">
        <button onClick={() => onToggle(worker)} title="Toggle active status"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            worker.isActive
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {worker.isActive
            ? <><ToggleRight size={14} /> Active</>
            : <><ToggleLeft size={14} /> Inactive</>}
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(worker)} title="Edit"
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(worker)} title="Delete"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
