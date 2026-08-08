"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, ArrowRight, ShieldCheck, Mail, CreditCard, Landmark, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get("ref") || "PAY-SUCCESS";
  const statusParam = searchParams.get("status");
  const sessionId = searchParams.get("session_id");

  const [verifying, setVerifying] = useState(!!sessionId);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const isPendingVerification = statusParam === "PENDING_VERIFICATION";

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/payments/verify-stripe-session?session_id=${sessionId}&ref=${paymentRef}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.payment) {
            setPaymentDetails(data.payment);
          }
        })
        .catch((err) => console.error("Error auto-verifying Stripe payment:", err))
        .finally(() => setVerifying(false));
    }
  }, [sessionId, paymentRef]);

  const paymentMethod = paymentDetails?.paymentMethod || (isPendingVerification ? "BANK_TRANSFER" : "CARD");

  return (
    <div className="bg-[#FAFBF9] min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow max-w-2xl w-full mx-auto px-4 py-16 mt-20 md:py-24">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12 text-center space-y-8">
          {verifying ? (
            <div className="space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-[#799A29] animate-spin mx-auto" />
              <p className="text-gray-600 font-semibold text-sm">Verifying payment status with Stripe...</p>
            </div>
          ) : (
            <>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                isPendingVerification ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
              }`}>
                <CheckCircle2 size={44} />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold font-serif text-dark">
                  {isPendingVerification ? "Payment Submitted!" : "Payment Successful!"}
                </h1>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  {isPendingVerification
                    ? "Your bank transfer payment slip has been submitted successfully and is currently pending verification."
                    : "Thank you for your payment. Your booking payment has been processed and verified securely."}
                </p>
              </div>

              <div className="bg-[#FAFBF9] border border-gray-100 p-6 rounded-2xl max-w-md mx-auto text-left space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 text-xs">
                  <span className="font-bold text-gray-500 uppercase">Payment Reference</span>
                  <span className="font-bold text-[#799A29] font-mono text-sm">{paymentDetails?.paymentReference || paymentRef}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 text-xs">
                  <span className="font-bold text-gray-500 uppercase">Payment Method</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    {paymentMethod === "CARD" ? (
                      <>
                        <CreditCard size={14} className="text-indigo-500" />
                        <span>Card (Stripe Online)</span>
                      </>
                    ) : (
                      <>
                        <Landmark size={14} className="text-emerald-500" />
                        <span>Bank Transfer</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 text-xs">
                  <span className="font-bold text-gray-500 uppercase">Status</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    isPendingVerification ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {isPendingVerification ? "Pending Verification" : "PAID"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                  <Mail size={14} className="text-[#799A29] shrink-0" />
                  <span>A payment confirmation receipt has been sent to your email address.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-8 py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-[#799A29]/20"
                >
                  Return to Homepage <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#799A29]" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
