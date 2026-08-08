"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Landmark,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  ExternalLink,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "PENDING_VERIFICATION" | "FAILED" | "REJECTED" | "CANCELLED";
type PaymentMethod = "CARD" | "BANK_TRANSFER";

interface PaymentRecord {
  id: string;
  paymentReference: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentGateway: string;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
  bankTransferReference?: string | null;
  paymentSlip?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  paidAt?: string | null;
  createdAt: string;
  referral?: {
    id: string;
    client?: {
      fullName: string;
      email: string;
      phoneNumber: string;
    } | null;
  } | null;
}

const statusBadgeConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PAID:                 { label: "PAID",                 className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  PENDING_VERIFICATION: { label: "Pending Verification", className: "bg-amber-100 text-amber-800 border-amber-200 animate-pulse" },
  PENDING:              { label: "Pending",              className: "bg-blue-100 text-blue-800 border-blue-200" },
  PROCESSING:           { label: "Processing",           className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  FAILED:               { label: "Failed",               className: "bg-rose-100 text-rose-800 border-rose-200" },
  REJECTED:             { label: "Rejected",             className: "bg-rose-100 text-rose-800 border-rose-200" },
  CANCELLED:            { label: "Cancelled",            className: "bg-gray-100 text-gray-700 border-gray-200" },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State for Preview & Rejection
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL("/api/admin/payments", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (searchTerm.trim()) url.searchParams.set("search", searchTerm.trim());

      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch payments");
      setPayments(data.payments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleApprove = async (paymentId: string) => {
    if (!confirm("Are you sure you want to approve this bank transfer payment? This will update status to PAID and issue a receipt to the client.")) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action: "APPROVE" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve payment");

      fetchPayments();
    } catch (err: any) {
      alert(err.message || "Failed to approve payment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: rejectingPayment.id,
          action: "REJECT",
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reject payment");

      setRejectingPayment(null);
      setRejectionReason("");
      fetchPayments();
    } catch (err: any) {
      alert(err.message || "Failed to reject payment.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif">Payment Management</h1>
          <p className="text-gray-500 text-sm mt-1">Verify bank transfers, review Stripe receipts, and manage billing records.</p>
        </div>

        <button
          onClick={() => fetchPayments()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-primary/40 hover:text-primary transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ref, client name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["ALL", "PENDING_VERIFICATION", "PAID", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status === "ALL" ? "All Payments" : statusBadgeConfig[status as PaymentStatus]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="p-4 font-semibold">Payment Ref</th>
                <th className="p-4 font-semibold">Client Name</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Method</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Payment Slip</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-36" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-28" /></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="p-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard size={36} className="text-gray-300" />
                      <p className="font-semibold text-sm">No payment records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const badge = statusBadgeConfig[p.paymentStatus] || { label: p.paymentStatus, className: "bg-gray-100 text-gray-700" };
                  const clientName = p.referral?.client?.fullName || "Valued Client";
                  const clientEmail = p.referral?.client?.email || "";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-dark text-xs block">{p.paymentReference}</span>
                        <span className="text-[11px] text-gray-400">{format(new Date(p.createdAt), "MMM d, yyyy · h:mm a")}</span>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-dark text-xs md:text-sm">{clientName}</p>
                        <p className="text-[11px] text-gray-400">{clientEmail}</p>
                      </td>

                      <td className="p-4 font-bold text-primary text-xs md:text-sm">
                        ${p.amount.toFixed(2)} {p.currency}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          {p.paymentMethod === "CARD" ? (
                            <>
                              <CreditCard size={14} className="text-indigo-500 shrink-0" />
                              <span>Card (Stripe)</span>
                            </>
                          ) : (
                            <>
                              <Landmark size={14} className="text-emerald-500 shrink-0" />
                              <span>Bank Transfer</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-4">
                        {p.paymentSlip ? (
                          <button
                            onClick={() => setSelectedSlip(p.paymentSlip || null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={12} /> View Slip
                          </button>
                        ) : (
                          <span className="text-gray-300 italic text-xs">—</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {p.paymentStatus === "PENDING_VERIFICATION" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleApprove(p.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => {
                                setRejectingPayment(p);
                                setRejectionReason("");
                              }}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Preview Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-dark font-serif text-lg">Payment Slip Preview</h3>
              <button onClick={() => setSelectedSlip(null)} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
              {selectedSlip.endsWith(".pdf") ? (
                <iframe src={selectedSlip} className="w-full h-96 rounded-xl" />
              ) : (
                <img src={selectedSlip} alt="Uploaded Payment Slip" className="max-w-full h-auto max-h-[60vh] object-contain rounded-xl" />
              )}
            </div>

            <div className="flex justify-end">
              <a
                href={selectedSlip}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <ExternalLink size={14} /> Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-dark font-serif text-lg">Reject Bank Transfer Payment</h3>
              <button onClick={() => setRejectingPayment(null)} className="text-gray-400 hover:text-dark">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Rejecting payment reference <strong>{rejectingPayment.paymentReference}</strong>. An email notification will be automatically sent to the customer informing them.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                Rejection Reason (Optional)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Could not match transaction reference on bank statement..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
