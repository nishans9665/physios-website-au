"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  DollarSign,
  Landmark,
  ShieldCheck,
  Save,
  Undo,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  CreditCard,
  FileText,
  BadgePercent,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPricingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pricing Parameters
  const [consultationFee, setConsultationFee] = useState<number | string>(150);
  const [initialConsultationFee, setInitialConsultationFee] = useState<number | string>(180);
  const [followupConsultationFee, setFollowupConsultationFee] = useState<number | string>(130);
  const [ndisRate, setNdisRate] = useState<number | string>(193.99);
  const [telehealthFee, setTelehealthFee] = useState<number | string>(120);

  // Bank Transfer Parameters
  const [bankName, setBankName] = useState("National Australia Bank (NAB)");
  const [accountName, setAccountName] = useState("The Care First Physiotherapy");
  const [bsbNumber, setBsbNumber] = useState("084-004");
  const [accountNumber, setAccountNumber] = useState("1234 5678 9");

  useEffect(() => {
    fetchPricingSettings();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const fetchPricingSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setConsultationFee(data.consultationFee ?? 150);
        setBankName(data.bankName || "National Australia Bank (NAB)");
        setAccountName(data.accountName || "The Care First Physiotherapy");
        setBsbNumber(data.bsbNumber || "084-004");
        setAccountNumber(data.accountNumber || "1234 5678 9");
      } else {
        showNotification("error", "Failed to retrieve pricing configuration.");
      }
    } catch (error) {
      console.error("Fetch pricing error:", error);
      showNotification("error", "Connection error loading pricing settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationFee: parseFloat(String(consultationFee)),
          bankName,
          accountName,
          bsbNumber,
          accountNumber,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification("success", "Pricing and bank details updated successfully!");
        fetchPricingSettings();
      } else {
        showNotification("error", data.error || "Failed to save pricing configuration.");
      }
    } catch (error) {
      console.error("Save pricing error:", error);
      showNotification("error", "Network failure. Failed to update pricing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-rose-600 shrink-0" size={20} />
            )}
            <p className="text-sm font-semibold leading-relaxed">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif flex items-center gap-2">
            <Tag className="text-[#799A29]" size={26} />
            Pricing & Billing Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure consultation fees, NDIS rates, and bank transfer payment instructions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 border-4 border-[#799A29] border-t-transparent rounded-full animate-spin text-[#799A29] shrink-0" />
          <p className="text-sm font-semibold">Retrieving pricing parameters...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* COLUMN 1 & 2: Fee Schedules & Bank Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* PANEL 1: Standard Consultation Rates */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Service Rates & Fee Schedule</h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Authoritative fee structures applied on online bookings and Stripe Checkout.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Default Consultation Fee */}
                  <div className="sm:col-span-2 space-y-1.5 bg-[#FAFBF9] p-4 rounded-2xl border border-emerald-100">
                    <label className="text-xs font-bold uppercase text-[#799A29] flex items-center justify-between">
                      <span>Primary Consultation Intake Fee ($ AUD) *</span>
                      <span className="text-[10px] text-gray-400 font-normal">Active on Stripe & Checkout</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        placeholder="150.00"
                        className="w-full pl-8 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-base font-bold text-dark bg-white"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">AUD</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      This fee is automatically loaded into online referral intake for private clients.
                    </p>
                  </div>

                  {/* Initial Assessment Fee */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">Initial Assessment Fee ($ AUD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={initialConsultationFee}
                        onChange={(e) => setInitialConsultationFee(e.target.value)}
                        placeholder="180.00"
                        className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white"
                      />
                    </div>
                  </div>

                  {/* Follow-up Fee */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">Follow-up Consultation Fee ($ AUD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={followupConsultationFee}
                        onChange={(e) => setFollowupConsultationFee(e.target.value)}
                        placeholder="130.00"
                        className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white"
                      />
                    </div>
                  </div>

                  {/* NDIS Hourly Support Rate */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">NDIS Support Hourly Rate ($ AUD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={ndisRate}
                        onChange={(e) => setNdisRate(e.target.value)}
                        placeholder="193.99"
                        className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white"
                      />
                    </div>
                  </div>

                  {/* Telehealth Consultation Fee */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">Telehealth Session Fee ($ AUD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={telehealthFee}
                        onChange={(e) => setTelehealthFee(e.target.value)}
                        placeholder="120.00"
                        className="w-full pl-8 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL 2: Direct Deposit / Bank Transfer Details */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl shrink-0">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Direct Bank Transfer Credentials</h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Account information displayed to clients selecting manual bank transfer on intake.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Bank Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">Financial Institution / Bank</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="National Australia Bank (NAB)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white"
                    />
                  </div>

                  {/* Account Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">Account Name</label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="The Care First Physiotherapy"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white"
                    />
                  </div>

                  {/* BSB Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">BSB Code</label>
                    <input
                      type="text"
                      required
                      value={bsbNumber}
                      onChange={(e) => setBsbNumber(e.target.value)}
                      placeholder="084-004"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white font-mono"
                    />
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-500">Account Number</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="1234 5678 9"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#799A29] text-sm text-dark bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Live Preview & Summary Card */}
            <div className="space-y-6">
              {/* LIVE INTAKE PREVIEW CARD */}
              <div className="bg-[#FAFBF9] p-6 rounded-3xl border border-gray-200 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                  <CreditCard size={18} className="text-[#799A29]" />
                  <h3 className="font-bold text-dark text-sm uppercase tracking-wider">Client Intake Live Preview</h3>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Consultation Fee</span>
                    <span className="font-extrabold text-base text-[#799A29]">
                      ${parseFloat(String(consultationFee) || "0").toFixed(2)} AUD
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-2">
                    Card payments are processed securely via Stripe.
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Bank Transfer Instructions</span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-dark">{bankName || "Bank Name"}</p>
                    <p className="text-gray-600">Account: <strong>{accountName || "Account Name"}</strong></p>
                    <div className="flex justify-between pt-1 font-mono text-[11px] text-gray-700">
                      <span>BSB: {bsbNumber || "000-000"}</span>
                      <span>Acc #: {accountNumber || "000000"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={fetchPricingSettings}
              disabled={submitting}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50"
            >
              <Undo size={16} />
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#799A29] text-white hover:opacity-95 font-semibold rounded-xl text-sm shadow-md transition-all cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  Saving Rates...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Pricing Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
