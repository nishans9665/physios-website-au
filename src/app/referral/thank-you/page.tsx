"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  Mail,
  Calendar,
  Home,
} from "lucide-react";

function ReferralThankYouContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "REF-SUBMITTED";
  const name = searchParams.get("name") || "Valued Client";
  const email = searchParams.get("email") || "N/A";
  const paymentType = searchParams.get("paymentType") || "Private";
  const status = searchParams.get("status") || "Submitted for Review";

  return (
    <div className="bg-[#FAFBF9] min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#799A29] py-12 mt-26 md:py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">
            Intake Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mt-4">
            Online Booking & Referral System
          </h1>
        </div>
      </div>

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-6 space-y-8 max-w-xl mx-auto"
          >
            {/* SUCCESS HERO HEADER */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <CheckCircle2 size={44} />
              </div>
              <div className="space-y-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">
                  Submission Complete
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-dark">
                  Booking & Referral Submitted!
                </h2>
                <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  Thank you. Your details have been received by our clinical intake team.
                </p>
              </div>
            </div>

            {/* RECEIPT / REFERENCE CARD */}
            <div className="bg-[#FAFBF9] border border-gray-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Reference Code</span>
                <span className="font-mono font-bold text-base text-[#799A29]">
                  {refCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Client Name</span>
                  <span className="font-bold text-dark">{name}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Contact Email</span>
                  <span className="font-bold text-dark truncate block">{email}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Payment Option</span>
                  <span className="font-bold text-dark">{paymentType}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Status</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                    {status}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 text-xs text-gray-500">
                <Mail size={15} className="text-[#799A29] shrink-0" />
                <span>A confirmation copy has been sent to <strong>{email !== "N/A" ? email : "your email"}</strong>.</span>
              </div>
            </div>

            {/* NEXT STEPS CHECKLIST */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3 text-left">
              <h4 className="text-xs font-bold uppercase text-[#799A29] tracking-wider">What Happens Next?</h4>
              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#799A29]/10 text-[#799A29] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <span><strong>Clinical Assessment:</strong> Our intake team reviews your details within 24 business hours.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#799A29]/10 text-[#799A29] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <span><strong>Schedule Confirmation:</strong> A clinic administrator will contact you or your NOK to confirm appointment date & time.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#799A29]/10 text-[#799A29] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <span><strong>Payment Verification:</strong> Payment slips uploaded via Bank Transfer will be verified by finance.</span>
                </li>
              </ul>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/"
                className="w-full py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs md:text-sm text-center hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Home size={16} /> Return to Home
              </Link>
              <Link
                href="/referral"
                className="w-full py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm text-center hover:opacity-95 shadow-md shadow-[#799A29]/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Calendar size={16} /> New Booking Referral
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ReferralThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#799A29]" />
        </div>
      }
    >
      <ReferralThankYouContent />
    </Suspense>
  );
}
