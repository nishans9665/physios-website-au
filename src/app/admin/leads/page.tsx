"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Trash2, 
  Mail, 
  Phone, 
  Clock, 
  Eye, 
  X, 
  User, 
  Briefcase, 
  FileText,
  MessageSquare,
  Save,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Lead = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  message: string;
  serviceInterest: string | null;
  status: "NEW" | "CONTACTED" | "PENDING" | "CONVERTED";
  adminNotes?: string | null;
  submissionDate: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Notes state for modal
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedLead) {
      setModalAdminNotes(selectedLead.adminNotes || "");
    }
  }, [selectedLead]);

  useEffect(() => {
    fetchCurrentUser();
    fetchLeads();
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

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE" });
      fetchLeads();
    } catch (error) {
      console.error("Failed to delete lead");
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: modalAdminNotes }),
      });
      if (res.ok) {
        setNotesSavedSuccess(true);
        setTimeout(() => setNotesSavedSuccess(false), 3000);
        setSelectedLead((prev) => (prev ? { ...prev, adminNotes: modalAdminNotes } : null));
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to save lead notes", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleModalStatusChange = async (newStatus: "NEW" | "CONTACTED" | "PENDING" | "CONVERTED") => {
    if (!selectedLead) return;
    await updateStatus(selectedLead.id, newStatus);
    setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleModalDelete = async () => {
    if (!selectedLead) return;
    const idToDelete = selectedLead.id;
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await fetch(`/api/leads/${idToDelete}`, { method: "DELETE" });
      fetchLeads();
      setSelectedLead(null);
    } catch (error) {
      console.error("Failed to delete lead");
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          lead.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-700";
      case "CONTACTED": return "bg-amber-100 text-amber-700";
      case "PENDING": return "bg-purple-100 text-purple-700";
      case "CONVERTED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone Number", "Service Interest", "Message", "Status", "Submission Date"];
    const rows = filteredLeads.map(lead => [
      `"${lead.fullName.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${(lead.phoneNumber || "").replace(/"/g, '""')}"`,
      `"${(lead.serviceInterest || "").replace(/"/g, '""')}"`,
      `"${lead.message.replace(/"/g, '""')}"`,
      `"${lead.status}"`,
      `"${format(new Date(lead.submissionDate), "yyyy-MM-dd HH:mm:ss")}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Contact Leads</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all incoming website inquiries and form submissions.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-primary text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative sm:w-48">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="PENDING">Pending</option>
              <option value="CONVERTED">Converted</option>
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium whitespace-nowrap">Contact Info</th>
                <th className="p-4 font-medium">Service Interest</th>
                <th className="p-4 font-medium">Message Preview</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium whitespace-nowrap">Submitted On</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-dark">{lead.fullName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {lead.email}
                      </div>
                      {lead.phoneNumber && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {lead.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{lead.serviceInterest || "-"}</td>
                    <td className="p-4 text-gray-600 max-w-[200px] truncate" title={lead.message}>
                      {lead.message}
                    </td>
                    <td className="p-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${getStatusColor(lead.status)}`}
                      >
                        <option value="NEW" className="bg-white text-dark">NEW</option>
                        <option value="CONTACTED" className="bg-white text-dark">CONTACTED</option>
                        <option value="PENDING" className="bg-white text-dark">PENDING</option>
                        <option value="CONVERTED" className="bg-white text-dark">CONVERTED</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(lead.submissionDate), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-xl transition-all duration-200 opacity-80 hover:opacity-100"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {currentUser?.role !== "STAFF_MANAGER" && (
                          <button 
                            onClick={() => deleteLead(lead.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 opacity-60 hover:opacity-100"
                            title="Delete Lead"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-2 text-xs">
            <div className="text-gray-500 font-medium">
              Showing <span className="font-bold text-dark">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-dark">{endIndex}</span> of{" "}
              <span className="font-bold text-dark">{totalItems}</span> lead records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-semibold text-gray-600 hover:bg-gray-50 hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-gray-400 font-bold">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                            currentPage === page
                              ? "bg-primary text-white shadow-xs"
                              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-dark"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-semibold text-gray-600 hover:bg-gray-50 hover:text-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Popup Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Backdrop close overlay */}
            <div className="absolute inset-0" onClick={() => setSelectedLead(null)} />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-primary p-6 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif text-white">Lead Details</h2>
                  <p className="text-white/80 text-xs mt-1">
                    Submitted on {format(new Date(selectedLead.submissionDate), "MMMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer border-none outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Lead Contact Card */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                      <User size={16} />
                      <span>Contact Info</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Full Name</label>
                        <p className="text-sm font-semibold text-dark">{selectedLead.fullName}</p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Email Address</label>
                        <a 
                          href={`mailto:${selectedLead.email}`}
                          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mt-0.5"
                        >
                          <Mail size={14} /> {selectedLead.email}
                        </a>
                      </div>
                      {selectedLead.phoneNumber && (
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400">Phone Number</label>
                          <a 
                            href={`tel:${selectedLead.phoneNumber}`}
                            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 mt-0.5"
                          >
                            <Phone size={14} /> {selectedLead.phoneNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lead Preference Card */}
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                      <Briefcase size={16} />
                      <span>Preferences</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Service Interest</label>
                        <p className="text-sm font-semibold text-dark mt-0.5">{selectedLead.serviceInterest || "Not Specified"}</p>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Lead Status</label>
                        <div className="mt-1">
                          <select 
                            value={selectedLead.status}
                            onChange={(e) => handleModalStatusChange(e.target.value as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-100 outline-none cursor-pointer ${getStatusColor(selectedLead.status)}`}
                          >
                            <option value="NEW" className="bg-white text-dark">NEW</option>
                            <option value="CONTACTED" className="bg-white text-dark">CONTACTED</option>
                            <option value="PENDING" className="bg-white text-dark">PENDING</option>
                            <option value="CONVERTED" className="bg-white text-dark">CONVERTED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message card */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                    <FileText size={16} />
                    <span>Inquiry Message</span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Comments / Admin Reference Notes Card */}
                <div className="bg-[#FAFBF9] p-5 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                      <MessageSquare size={16} />
                      <span>Comments & User Reference Notes</span>
                    </div>
                    {notesSavedSuccess && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={13} /> Notes Saved!
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    placeholder="Type internal comments, user call reference details, or follow-up notes to save for this lead..."
                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs bg-white resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={savingNotes}
                      onClick={handleSaveAdminNotes}
                      className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer border-none shadow-xs disabled:opacity-50"
                    >
                      {savingNotes ? (
                        <>
                          <Loader2 className="animate-spin" size={14} /> Saving Notes...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save Comment Notes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                {currentUser?.role !== "STAFF_MANAGER" ? (
                  <button 
                    onClick={handleModalDelete}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-sm transition-colors flex items-center gap-1.5 cursor-pointer border-none outline-none"
                  >
                    <Trash2 size={16} />
                    Delete Lead
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedLead(null)}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 rounded-xl text-sm transition-colors cursor-pointer border-none outline-none"
                  >
                    Close Dialog
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
