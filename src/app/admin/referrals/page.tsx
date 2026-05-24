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
  Plus,
  Calendar,
  Heart,
  Shield,
  Download,
  Printer,
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Client = {
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  address: string;
  reasonForReferral?: string | null;
};

type Contact = {
  contactName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

type Referrer = {
  referrerName: string;
  companyName: string | null;
  email: string;
  phoneNumber: string;
  address: string;
};

type NdisDetails = {
  managementType: string;
  planStartDate: string | null;
  participantId: string | null;
  planEndDate: string | null;
  planManagerName: string | null;
  planManagerContact: string | null;
  fundingArea: string | null;
};

type AdminNote = {
  id: string;
  authorName: string;
  noteText: string;
  createdAt: string;
};

type Referral = {
  id: string;
  paymentType: string;
  providerName: string | null;
  invoiceContactName: string | null;
  coordinatorName: string | null;
  invoiceEmail: string | null;
  preferredAppointmentType: string;
  unavailability: string | null;
  preferredDays: string | null;
  preferredTime: string | null;
  status: "NEW" | "PENDING_REVIEW" | "CONTACTED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  privacyConsent: boolean;
  contactConsent: boolean;
  medicalConsent: boolean;
  createdAt: string;
  
  client?: Client;
  contact?: Contact;
  referrer?: Referrer;
  ndisDetails?: NdisDetails | null;
  adminNotes?: AdminNote[];
};

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailedReferral, setDetailedReferral] = useState<Referral | null>(null);
  
  // Note writing state
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedId) {
      fetchReferralDetails(selectedId);
    } else {
      setDetailedReferral(null);
    }
  }, [selectedId]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`);
      if (res.ok) {
        const data = await res.json();
        setReferrals(data);
      }
    } catch (error) {
      console.error("Failed to fetch referrals", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/referrals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetailedReferral(data);
      }
    } catch (error) {
      console.error("Failed to fetch referral details", error);
    }
  };

  const updateReferralStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchReferrals();
        if (detailedReferral && detailedReferral.id === id) {
          setDetailedReferral(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const addAdminNote = async () => {
    if (!selectedId || !newNote.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/referrals/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          noteText: newNote,
          authorName: "Clinical Manager" 
        })
      });
      if (res.ok) {
        setNewNote("");
        fetchReferralDetails(selectedId);
      }
    } catch (error) {
      console.error("Failed to add note", error);
    } finally {
      setNoteLoading(false);
    }
  };

  const deleteReferral = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this referral record? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/referrals/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchReferrals();
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete referral", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-50 text-blue-700 border-blue-100";
      case "PENDING_REVIEW": return "bg-amber-50 text-amber-700 border-amber-100";
      case "CONTACTED": return "bg-purple-50 text-purple-700 border-purple-100";
      case "APPROVED": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "IN_PROGRESS": return "bg-[#799A29]/10 text-[#799A29] border-[#799A29]/20";
      case "COMPLETED": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW": return "New";
      case "PENDING_REVIEW": return "Pending Review";
      case "CONTACTED": return "Contacted";
      case "APPROVED": return "Approved";
      case "IN_PROGRESS": return "In Progress";
      case "COMPLETED": return "Completed";
      default: return status;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold font-serif text-dark flex items-center gap-2">
            <Calendar className="text-[#799A29]" size={26} />
            Appointments
          </h1>
          <p className="text-gray-500 text-sm">
            Review online booking intakes, NDIS patient plans, clinical diagnostics, and home care appointments.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search by client, email, or referrer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter size={16} className="text-gray-400 shrink-0 hidden sm:block" />
          {["ALL", "NEW", "PENDING_REVIEW", "CONTACTED", "APPROVED", "IN_PROGRESS", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status 
                  ? "bg-[#799A29] text-white border-transparent" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status === "ALL" ? "All Appointments" : getStatusLabel(status)}
            </button>
          ))}
        </div>

      </div>

      {/* REFERRALS MAIN TABLE */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
            <span className="animate-spin w-8 h-8 border-3 border-[#799A29] border-t-transparent rounded-full" />
            <p className="text-xs">Loading appointments...</p>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-20 text-gray-400 space-y-2">
            <Calendar className="mx-auto text-gray-200" size={48} />
            <p className="text-sm font-semibold">No appointments found</p>
            <p className="text-xs text-gray-400">Try matching different query criteria or filter states.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted On</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-dark font-medium">
                {referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-dark">{ref.client?.fullName}</p>
                        <p className="text-xs text-gray-400">{ref.client?.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                        {ref.paymentType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(ref.status)}`}>
                        {getStatusLabel(ref.status)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {format(new Date(ref.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedId(ref.id)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-xl transition-all duration-200"
                          title="Open Details Chart"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => deleteReferral(ref.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200"
                          title="Delete Intake"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILS VIEW DIALOG MODAL */}
      <AnimatePresence>
        {selectedId && detailedReferral && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:relative print:bg-white print:p-0 print:inset-auto print:z-0 print:block">
            {/* Backdrop Dismiss Overlay */}
            <div className="absolute inset-0 print:hidden" onClick={() => setSelectedId(null)} />

            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh] print:relative print:w-full print:max-h-none print:shadow-none print:rounded-none print:border-none print:p-0"
            >
              
              {/* PRINT HEADER - ONLY VISIBLE WHEN PRINTING */}
              <div className="hidden print:block border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider font-serif">The Care First Physiotherapy Service</h1>
                    <p className="text-xs text-gray-500">Online Intake & Clinical Referral Chart</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Referral ID: {detailedReferral.id}</p>
                    <p>Date: {format(new Date(detailedReferral.createdAt), "MMMM dd, yyyy")}</p>
                  </div>
                </div>
              </div>

              {/* Standard Header */}
              <div className="bg-[#799A29] p-6 text-white flex items-center justify-between print:hidden">
                <div className="space-y-1">
                  <span className="bg-white/20 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    {detailedReferral.paymentType} Intake
                  </span>
                  <h2 className="text-xl font-bold font-serif text-white">{detailedReferral.client?.fullName}</h2>
                  <p className="text-white/80 text-xs">
                    Submitted on {format(new Date(detailedReferral.createdAt), "MMMM dd, yyyy hh:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrint}
                    className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    title="Print Referral Chart"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Dialog Body scrollable */}
              <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-grow print:p-0 print:overflow-visible">
                
                {/* 2 Column Details */}
                <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
                  
                  {/* CLIENT DEMOGRAPHICS CARD */}
                  <div className="border border-gray-100 p-5 rounded-2xl space-y-4 bg-gray-50/50 print:bg-white print:p-0 print:border-none">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider print:text-black">
                      <User size={14} />
                      <span>Client Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Full Name</label>
                        <p className="font-semibold text-dark">{detailedReferral.client?.fullName}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Date of Birth</label>
                        <p className="font-semibold text-dark">
                          {detailedReferral.client?.dob ? format(new Date(detailedReferral.client.dob), "dd/MM/yyyy") : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Email Address</label>
                        <a href={`mailto:${detailedReferral.client?.email}`} className="font-semibold text-primary hover:underline print:text-black break-all">{detailedReferral.client?.email}</a>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Phone Number</label>
                        <a href={`tel:${detailedReferral.client?.phoneNumber}`} className="font-semibold text-primary hover:underline print:text-black break-all">{detailedReferral.client?.phoneNumber}</a>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Gender</label>
                        <p className="font-semibold text-dark">{detailedReferral.client?.gender}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Home Address</label>
                        <p className="font-semibold text-dark whitespace-pre-line">{detailedReferral.client?.address}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Reason for Referral</label>
                        <p className="font-semibold text-dark whitespace-pre-line">{detailedReferral.client?.reasonForReferral || "Not Specified"}</p>
                      </div>
                    </div>
                  </div>

                  {/* NEXT OF KIN & REFERRER SPECIFICATION */}
                  <div className="border border-gray-100 p-5 rounded-2xl space-y-4 bg-gray-50/50 print:bg-white print:p-0 print:border-none">
                    

                    {/* NOK info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider print:text-black">
                        <User size={14} />
                        <span>Alternative / NOK Contact</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-gray-400 block">Contact Name</label>
                          <p className="font-semibold text-dark">{detailedReferral.contact?.contactName || "-"}</p>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-gray-400 block">NOK Phone</label>
                          <p className="font-semibold text-dark break-all">{detailedReferral.contact?.phoneNumber || "-"}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* NDIS DYNAMIC SPECS CARD */}
                {detailedReferral.paymentType === "NDIS" && detailedReferral.ndisDetails && (
                  <div className="border border-[#799A29]/10 p-5 rounded-2xl space-y-4 bg-[#799A29]/5 print:bg-white print:p-0 print:border-none">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider print:text-black">
                      <Shield size={14} />
                      <span>NDIS Participant Parameters</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-2 text-xs print:grid-cols-2">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#799A29] block print:text-gray-400">NDIS Management</label>
                        <p className="font-bold text-dark mt-0.5">{detailedReferral.ndisDetails.managementType}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#799A29] block print:text-gray-400">Participant ID</label>
                        <p className="font-bold text-dark mt-0.5">{detailedReferral.ndisDetails.participantId}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#799A29] block print:text-gray-400">Plan Start Date</label>
                        <p className="font-semibold text-dark mt-0.5">
                          {detailedReferral.ndisDetails.planStartDate ? format(new Date(detailedReferral.ndisDetails.planStartDate), "dd/MM/yyyy") : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#799A29] block print:text-gray-400">Plan End Date</label>
                        <p className="font-semibold text-dark mt-0.5">
                          {detailedReferral.ndisDetails.planEndDate ? format(new Date(detailedReferral.ndisDetails.planEndDate), "dd/MM/yyyy") : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-[#799A29] block print:text-gray-400">Plan Manager Name</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.ndisDetails.planManagerName || "-"}</p>
                      </div>
                      <div className="col-span-3">
                        <label className="text-[9px] uppercase font-bold text-[#799A29] block print:text-gray-400">Plan Manager Contact</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.ndisDetails.planManagerContact || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* INVOICING & APPOINTMENT PREFERENCES */}
                <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
                  
                  {/* APPOINTMENT PREFERENCES CARD */}
                  <div className="border border-gray-100 p-5 rounded-2xl space-y-4 bg-gray-50/50 print:bg-white print:p-0 print:border-none">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider print:text-black">
                      <Calendar size={14} />
                      <span>Scheduling Preferences</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Consultation Type</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.preferredAppointmentType}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Time Allocation</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.preferredTime || "No Preference"}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Preferred Days</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.preferredDays || "Any Day"}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Unavailability Specs</label>
                        <p className="font-semibold text-dark mt-0.5 whitespace-pre-wrap">{detailedReferral.unavailability || "None Logged"}</p>
                      </div>
                    </div>
                  </div>

                  {/* INVOICING / BILLING */}
                  <div className="border border-gray-100 p-5 rounded-2xl space-y-4 bg-gray-50/50 print:bg-white print:p-0 print:border-none">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider print:text-black">
                      <Briefcase size={14} />
                      <span>Billing & Invoicing</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Care Coordinator Name</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.coordinatorName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Provider Business</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.providerName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Invoice Contact Name</label>
                        <p className="font-semibold text-dark mt-0.5">{detailedReferral.invoiceContactName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 block">Invoice Email Address</label>
                        <p className="font-semibold text-dark mt-0.5 break-all">{detailedReferral.invoiceEmail || "-"}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* AUDIT LOG NOTES SECTION */}
                <div className="border border-gray-100 p-5 rounded-2xl space-y-4 bg-gray-50/50 print:hidden">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Clock size={14} />
                    <span>Internal Audit Notes</span>
                  </div>

                  {/* Add Note Input */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add an internal audit note to this referral chart..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-grow px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white"
                    />
                    <button
                      type="button"
                      disabled={noteLoading || !newNote.trim()}
                      onClick={addAdminNote}
                      className="px-4 py-2.5 bg-[#799A29] text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all shrink-0 cursor-pointer disabled:opacity-50 border-none"
                    >
                      {noteLoading ? "Saving..." : "Add Note"}
                    </button>
                  </div>

                  {/* Notes thread */}
                  {detailedReferral.adminNotes && detailedReferral.adminNotes.length > 0 ? (
                    <div className="space-y-3.5 max-h-56 overflow-y-auto pr-2">
                      {detailedReferral.adminNotes.map((note) => (
                        <div key={note.id} className="bg-white p-3 rounded-xl border border-gray-100 text-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                            <span>{note.authorName}</span>
                            <span>{format(new Date(note.createdAt), "dd MMM yyyy hh:mm a")}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{note.noteText}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      No internal notes recorded. Enter a note above to start the review thread.
                    </div>
                  )}

                </div>

              </div>

              {/* Dialog Footer Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between print:hidden">
                
                {/* Delete direct */}
                <button
                  type="button"
                  onClick={() => deleteReferral(detailedReferral.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
                >
                  Delete Chart
                </button>

                {/* Status Dropdown + Close */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Status</label>
                    <select
                      value={detailedReferral.status}
                      onChange={(e) => updateReferralStatus(detailedReferral.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 outline-none cursor-pointer bg-white text-dark`}
                    >
                      <option value="NEW">New</option>
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="APPROVED">Approved</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 rounded-xl text-xs transition-colors cursor-pointer border-none"
                  >
                    Close Chart
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
