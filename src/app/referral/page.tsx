"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Plus,
  Trash2,
  Upload,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  FileCheck,
  CreditCard,
  Landmark,
  Lock,
  FileUp,
  Loader2,
  Check,
} from "lucide-react";

const STEPS = [
  "Client Details",
  "Next of Kin",
  "Payment Details",
  "Appointment Prefs",
  "NDIS Details",
  "Consent & Review",
  "Payment & Complete",
];

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Transgender / Non Binary / Gender Diverse",
  "Prefer not to answer",
];

const PAYMENT_OPTIONS = [
  "Private",
  "CHSP Provider",
  "NDIS",
  "Medicare",
  "CDM/EPC",
  "Home Care Package",
  "Other",
];

const APPOINTMENT_TYPES = ["Face to Face", "Telehealth", "No Preference"];
const STORAGE_KEY = "physio_referral_draft";

const INITIAL_FORM_DATA = {
  client: {
    fullName: "",
    email: "",
    address: "",
    phoneNumber: "",
    dob: "",
    gender: "Prefer not to answer",
    reasonForReferral: "",
  },
  contact: {
    contactName: "",
    email: "",
    address: "",
    phoneNumber: "",
  },
  paymentType: "Private",
  paymentMethod: "CARD" as "CARD" | "BANK_TRANSFER",
  invoiceContactName: "",
  invoiceEmail: "",
  paymentSlipUrl: "",
  paymentReference: "",
  paymentSubmitted: false,
  preferredAppointmentType: "Face to Face",
  unavailability: "",
  preferredDays: [] as string[],
  preferredTime: "Morning",
  ndisDetails: {
    managementType: "Self Managed",
    planStartDate: "",
    participantId: "",
    planEndDate: "",
    planManagerName: "",
    planManagerContact: "",
    fundingArea: "",
  },
  privacyConsent: false,
  contactConsent: false,
  medicalConsent: false,
};

export default function ReferralPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipUploadSuccess, setSlipUploadSuccess] = useState(false);
  const [processingStripe, setProcessingStripe] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedRef, setSubmittedRef] = useState("");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          setFormData(parsed.formData);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          setDraftRestored(true);
          setTimeout(() => setDraftRestored(false), 5000);
        }
      }
    } catch (e) {
      console.error("Failed to restore draft:", e);
    }
  }, []);

  const saveDraft = (updatedForm: typeof formData, step: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData: updatedForm, currentStep: step }));
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(INITIAL_FORM_DATA);
    setPaymentSlipFile(null);
    setSlipUploadSuccess(false);
    setUploadingSlip(false);
    setValidationError("");
  };

  const handleSimpleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const handleNestedChange = (parent: "client" | "contact" | "ndisDetails", field: string, value: any) => {
    setFormData((prev: any) => {
      const updated = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value,
        },
      };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const togglePreferredDay = (day: string) => {
    setFormData((prev) => {
      const days = prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      const updated = { ...prev, preferredDays: days };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const validateStep = (step: number): boolean => {
    setValidationError("");
    switch (step) {
      case 1:
        if (!formData.client.fullName.trim() || !formData.client.email.trim() || !formData.client.phoneNumber.trim() || !formData.client.dob)
          return failValidation("Please fill all required client details.");
        break;
      case 3:
        if (!formData.paymentType) return failValidation("Please select a Payment Type.");
        break;
      case 5:
        if (formData.paymentType === "NDIS" && !formData.ndisDetails.participantId?.trim())
          return failValidation("NDIS Participant ID is required.");
        break;
      case 6:
        if (!formData.privacyConsent || !formData.contactConsent || !formData.medicalConsent)
          return failValidation("You must check all consents to proceed.");
        break;
    }
    return true;
  };

  const failValidation = (msg: string): boolean => {
    setValidationError(msg);
    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      let next = currentStep + 1;
      if (currentStep === 4 && formData.paymentType !== "NDIS") next = 6;
      if (currentStep === 6 && formData.paymentType !== "Private") {
        handleSubmitDirect();
        return;
      }
      setCurrentStep(next);
      saveDraft(formData, next);
    }
  };

  const handlePrev = () => {
    let prev = currentStep - 1;
    if (currentStep === 7) prev = 6;
    else if (currentStep === 6 && formData.paymentType !== "NDIS") prev = 4;
    setCurrentStep(prev);
    saveDraft(formData, prev);
  };

  const handleProceedToStripe = async () => {
    setProcessingStripe(true);
    setValidationError("");
    try {
      let referralId = "";
      const refRes = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (refRes.ok) {
        const refData = await refRes.json();
        referralId = refData.referral?.id || refData.id || "";
      }
      const res = await fetch("/api/payments/create-stripe-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, clientEmail: formData.client.email, clientName: formData.client.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize Stripe.");
      clearDraft();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setValidationError(err.message || "Failed to connect to payment gateway.");
    } finally {
      setProcessingStripe(false);
    }
  };

  const handleUploadPaymentSlip = async (fileToUpload?: File) => {
    const file = fileToUpload || paymentSlipFile;
    if (!file) return "";
    setUploadingSlip(true);
    setValidationError("");
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload payment slip");
      setFormData((prev) => ({ ...prev, paymentSlipUrl: data.fileUrl }));
      setSlipUploadSuccess(true);
      return data.fileUrl as string;
    } catch (err: any) {
      setValidationError(err.message || "Failed to upload payment slip file.");
      return "";
    } finally {
      setUploadingSlip(false);
    }
  };

  const handleBankTransferSubmit = async () => {
    setSubmitLoading(true);
    setValidationError("");

    try {
      let slipUrl = formData.paymentSlipUrl;
      if (!slipUrl && paymentSlipFile) {
        slipUrl = await handleUploadPaymentSlip(paymentSlipFile);
      }

      if (!slipUrl) {
        setSubmitLoading(false);
        return setValidationError("Please select and upload a payment slip file first.");
      }

      const refRes = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const refData = await refRes.json();
      if (!refRes.ok) throw new Error(refData.error || "Failed to save referral details");

      const referralId = refData.referralId || refData.referral?.id || refData.id;
      if (!referralId) throw new Error("Failed to retrieve valid referral ID");

      const btRes = await fetch("/api/payments/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralId,
          clientEmail: formData.client.email || formData.invoiceEmail,
          clientName: formData.client.fullName || formData.invoiceContactName,
          paymentSlip: slipUrl,
        }),
      });

      const btData = await btRes.json();
      if (!btRes.ok) throw new Error(btData.error || "Failed to submit bank transfer.");

      clearDraft();
      window.location.href = `/referral/payment-success?ref=${btData.paymentReference}&status=PENDING_VERIFICATION`;
    } catch (err: any) {
      setValidationError(err.message || "Error submitting bank transfer.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitDirect = async () => {
    setSubmitLoading(true);
    setError("");
    setValidationError("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Submission failed.");
      const generatedRef = resData.referral?.id
        ? `REF-${resData.referral.id.slice(-8).toUpperCase()}`
        : `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setSubmittedRef(generatedRef);
      clearDraft();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBF9] min-h-screen flex flex-col font-sans">
      <Navbar />
      <div className="bg-[#799A29] py-12 mt-26 md:py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">Intake Portal</span>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mt-4">Online Booking & Referral System</h1>
        </div>
      </div>

      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        {!success && (
          <div className="mb-8 md:mb-12 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] px-2 relative">
              {(() => {
                const visibleSteps = STEPS.filter((label, idx) => {
                  const stepNum = idx + 1;
                  if (stepNum === 5 && formData.paymentType !== "NDIS") return false;
                  if (stepNum === 7 && formData.paymentType !== "Private") return false;
                  return true;
                });
                const currentVisibleIndex = visibleSteps.indexOf(STEPS[currentStep - 1]);
                const progressPercentage = (currentVisibleIndex / Math.max(visibleSteps.length - 1, 1)) * 100;
                return (
                  <>
                    <div className="absolute top-[18px] left-8 right-8 h-[3px] bg-gray-100 z-0">
                      <div className="h-full bg-[#799A29] transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                    </div>
                    {visibleSteps.map((label, index) => {
                      const displayStepNum = index + 1;
                      const actualStepNum = STEPS.indexOf(label) + 1;
                      const isActive = currentStep === actualStepNum;
                      const isCompleted = currentStep > actualStepNum;
                      return (
                        <div key={label} className="flex flex-col items-center z-10 relative cursor-pointer" onClick={() => { if (actualStepNum < currentStep) setCurrentStep(actualStepNum); }}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isActive ? "bg-[#799A29] text-white" : isCompleted ? "bg-[#799A29] text-white" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                            {isCompleted ? <CheckCircle2 size={16} /> : displayStepNum}
                          </div>
                          <span className={`text-[11px] font-bold mt-2 uppercase tracking-wider ${isActive ? "text-[#799A29]" : "text-gray-400"}`}>
                            {label === "Consent & Review" ? "Consent" : label.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
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
                      {submittedRef || "PAY-PENDING"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Client Name</span>
                      <span className="font-bold text-dark">{formData.client.fullName || "Valued Client"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Contact Email</span>
                      <span className="font-bold text-dark truncate block">{formData.client.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Payment Option</span>
                      <span className="font-bold text-dark">{formData.paymentType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase text-[10px] block mb-0.5">Status</span>
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800">
                        {formData.paymentType === "Private" && formData.paymentMethod === "BANK_TRANSFER"
                          ? "Pending Verification"
                          : "Submitted for Review"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={15} className="text-[#799A29] shrink-0" />
                    <span>A confirmation copy has been sent to <strong>{formData.client.email || "your email"}</strong>.</span>
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
                  <a
                    href="/"
                    className="w-full py-3.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs md:text-sm text-center hover:bg-gray-50 transition-colors"
                  >
                    Return to Home
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      clearDraft();
                      setSuccess(false);
                      setSubmittedRef("");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm text-center hover:opacity-95 shadow-md shadow-[#799A29]/20 transition-all cursor-pointer"
                  >
                    New Booking Referral
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold font-serif text-dark flex items-center gap-2">
                    {STEPS[currentStep - 1]}
                  </h3>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  {/* STEP 1: Client Details */}
                  {currentStep === 1 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Full Name *</label>
                        <input type="text" required value={formData.client.fullName} onChange={(e) => handleNestedChange("client", "fullName", e.target.value)} placeholder="e.g. John Citizen" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Email Address *</label>
                        <input type="email" required value={formData.client.email} onChange={(e) => handleNestedChange("client", "email", e.target.value)} placeholder="e.g. john@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Phone Number *</label>
                        <input type="tel" required value={formData.client.phoneNumber} onChange={(e) => handleNestedChange("client", "phoneNumber", e.target.value)} placeholder="e.g. 0400 000 000" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Date of Birth *</label>
                        <input type="date" required value={formData.client.dob} onChange={(e) => handleNestedChange("client", "dob", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Gender Selection *</label>
                        <select value={formData.client.gender} onChange={(e) => handleNestedChange("client", "gender", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                          {GENDER_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Home Address *</label>
                        <textarea rows={2} value={formData.client.address} onChange={(e) => handleNestedChange("client", "address", e.target.value)} placeholder="Street, Suburb, Postcode" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none resize-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Reason for Referral</label>
                        <textarea rows={2} value={formData.client.reasonForReferral} onChange={(e) => handleNestedChange("client", "reasonForReferral", e.target.value)} placeholder="Brief reason for referral" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none resize-none" />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Next of Kin */}
                  {currentStep === 2 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Alternative Contact / NOK Name</label>
                        <input type="text" value={formData.contact.contactName} onChange={(e) => handleNestedChange("contact", "contactName", e.target.value)} placeholder="e.g. Mary Citizen" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NOK Email Address</label>
                        <input type="email" value={formData.contact.email} onChange={(e) => handleNestedChange("contact", "email", e.target.value)} placeholder="e.g. mary@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NOK Contact Number</label>
                        <input type="tel" value={formData.contact.phoneNumber} onChange={(e) => handleNestedChange("contact", "phoneNumber", e.target.value)} placeholder="e.g. 0411 111 111" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Postal Address</label>
                        <textarea rows={2} value={formData.contact.address} onChange={(e) => handleNestedChange("contact", "address", e.target.value)} placeholder="Postal details" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none resize-none" />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Payment Option & Billing Details */}
                  {currentStep === 3 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Payment Option *</label>
                        <select value={formData.paymentType} onChange={(e) => handleSimpleChange("paymentType", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:border-[#799A29] focus:outline-none">
                          {PAYMENT_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Invoice/Accounts Contact Name</label>
                        <input type="text" value={formData.invoiceContactName} onChange={(e) => handleSimpleChange("invoiceContactName", e.target.value)} placeholder="e.g. Accounts Dept" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Billing / Invoice Email Address</label>
                        <input type="email" value={formData.invoiceEmail} onChange={(e) => handleSimpleChange("invoiceEmail", e.target.value)} placeholder="e.g. accounts@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none" />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Appointment Preferences */}
                  {currentStep === 4 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Preferred Appointment Method</label>
                        <select value={formData.preferredAppointmentType} onChange={(e) => handleSimpleChange("preferredAppointmentType", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                          {APPOINTMENT_TYPES.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Preferred Consult Time</label>
                        <select value={formData.preferredTime} onChange={(e) => handleSimpleChange("preferredTime", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                          <option value="Morning">Morning (8am - 12pm)</option>
                          <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                          <option value="Evening">Evening (4pm - 7pm)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Preferred Days (Select Multiple)</label>
                        <div className="flex flex-wrap gap-2.5">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                            const isSelected = formData.preferredDays.includes(day);
                            return (
                              <button type="button" key={day} onClick={() => togglePreferredDay(day)} className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isSelected ? "bg-[#799A29]/10 border-[#799A29] text-[#799A29]" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                          Specific Unavailability Details
                        </label>
                        <textarea
                          rows={3}
                          value={formData.unavailability}
                          onChange={(e) => handleSimpleChange("unavailability", e.target.value)}
                          placeholder="e.g. Cannot attend Tuesdays before 11am due to community center visit"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: NDIS Details */}
                  {currentStep === 5 && formData.paymentType === "NDIS" && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NDIS Management Type *</label>
                        <select value={formData.ndisDetails.managementType} onChange={(e) => handleNestedChange("ndisDetails", "managementType", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white">
                          <option value="Self Managed">Self Managed</option>
                          <option value="Agency Managed">Agency Managed</option>
                          <option value="Plan Managed">Plan Managed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Participant NDIS Number *</label>
                        <input type="text" required value={formData.ndisDetails.participantId} onChange={(e) => handleNestedChange("ndisDetails", "participantId", e.target.value)} placeholder="e.g. 430000000" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NDIS Plan Start Date</label>
                        <input type="date" value={formData.ndisDetails.planStartDate} onChange={(e) => handleNestedChange("ndisDetails", "planStartDate", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NDIS Plan End Date</label>
                        <input type="date" value={formData.ndisDetails.planEndDate} onChange={(e) => handleNestedChange("ndisDetails", "planEndDate", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Plan Manager Name (if Plan Managed)</label>
                        <input type="text" value={formData.ndisDetails.planManagerName} onChange={(e) => handleNestedChange("ndisDetails", "planManagerName", e.target.value)} placeholder="e.g. Plan Partners" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Plan Manager Contact details</label>
                        <input type="text" value={formData.ndisDetails.planManagerContact} onChange={(e) => handleNestedChange("ndisDetails", "planManagerContact", e.target.value)} placeholder="e.g. email or phone number" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Funding Area Allocation</label>
                        <input type="text" value={formData.ndisDetails.fundingArea} onChange={(e) => handleNestedChange("ndisDetails", "fundingArea", e.target.value)} placeholder="Therapeutic Supports, Improved Daily Living, etc." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                      </div>
                    </div>
                  )}

                  {/* STEP 6: Consent & Review */}
                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <div className="bg-[#FAFBF9] border border-gray-100 p-6 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold uppercase text-[#799A29] tracking-wider">Clinical Consent Agreements</h4>
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.privacyConsent} onChange={(e) => handleSimpleChange("privacyConsent", e.target.checked)} className="mt-1 w-4 h-4 text-[#799A29] border-gray-300 rounded cursor-pointer" />
                            <span className="text-xs text-gray-600">I agree to the Privacy Policy and handling of personal/medical details under Australian privacy standards. *</span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.contactConsent} onChange={(e) => handleSimpleChange("contactConsent", e.target.checked)} className="mt-1 w-4 h-4 text-[#799A29] border-gray-300 rounded cursor-pointer" />
                            <span className="text-xs text-gray-600">I consent to clinical staff contacting client/NOK/referring doctor to coordinate appointments. *</span>
                          </label>
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.medicalConsent} onChange={(e) => handleSimpleChange("medicalConsent", e.target.checked)} className="mt-1 w-4 h-4 text-[#799A29] border-gray-300 rounded cursor-pointer" />
                            <span className="text-xs text-gray-600">I confirm that all entered details and medical history are accurate and true. *</span>
                          </label>
                        </div>
                      </div>

                      {formData.paymentType === "Private" ? (
                        <div className="text-center py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800">
                          Form details complete! Click "Proceed to Payment" below to choose Card Payment or Bank Transfer.
                        </div>
                      ) : (
                        <div className="text-center py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-semibold text-gray-500">
                          Click "Submit Referral" below to complete your booking.
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 7: Payment & Complete (FINAL STEP FOR PRIVATE BOOKINGS) */}
                  {currentStep === 7 && formData.paymentType === "Private" && (
                    <div className="space-y-6">
                      <div className="bg-[#FAFBF9] border border-gray-200/80 p-5 rounded-2xl space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Client Booking</span>
                            <h4 className="text-base font-bold text-dark">{formData.client.fullName || "Valued Client"}</h4>
                          </div>
                          <div className="sm:text-right">
                            <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Consultation Fee</span>
                            <p className="text-lg font-extrabold text-[#799A29]">$150.00 AUD</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 border-t border-gray-200/60 pt-2.5">
                          Form details saved. Please select your preferred payment method below to complete your booking intake.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-dark uppercase tracking-wider mb-3">Select Payment Method *</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div onClick={() => handleSimpleChange("paymentMethod", "CARD")} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${formData.paymentMethod === "CARD" ? "border-[#799A29] bg-[#799A29]/5 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === "CARD" ? "bg-[#799A29] text-white" : "bg-gray-100 text-gray-500"}`}>
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-dark text-sm">Card Payment</p>
                              <p className="text-xs text-gray-500">Visa, Mastercard, AMEX via Stripe</p>
                            </div>
                          </div>

                          <div onClick={() => handleSimpleChange("paymentMethod", "BANK_TRANSFER")} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${formData.paymentMethod === "BANK_TRANSFER" ? "border-[#799A29] bg-[#799A29]/5 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === "BANK_TRANSFER" ? "bg-[#799A29] text-white" : "bg-gray-100 text-gray-500"}`}>
                              <Landmark size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-dark text-sm">Online Bank Transfer</p>
                              <p className="text-xs text-gray-500">Direct deposit & upload slip</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {formData.paymentMethod === "CARD" && (
                        <div className="bg-[#FAFBF9] border border-gray-200 p-6 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-500">Consultation Fee:</span>
                            <span className="font-bold text-base text-[#799A29]">$150.00 AUD</span>
                          </div>
                          <button type="button" disabled={processingStripe} onClick={handleProceedToStripe} className="w-full py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-[#799A29]/20 disabled:opacity-60 cursor-pointer">
                            {processingStripe ? <><Loader2 className="animate-spin" size={18} /> Connecting to Stripe...</> : <><Lock size={16} /> Proceed to Secure Payment</>}
                          </button>
                        </div>
                      )}

                      {formData.paymentMethod === "BANK_TRANSFER" && (
                        <div className="bg-[#FAFBF9] border border-gray-200 p-6 rounded-2xl space-y-4">
                          <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-gray-100">
                            <div><span className="text-gray-400 font-semibold uppercase text-[10px]">Bank</span><span className="font-bold block text-dark">National Australia Bank (NAB)</span></div>
                            <div><span className="text-gray-400 font-semibold uppercase text-[10px]">Account Name</span><span className="font-bold block text-dark">The Care First Physiotherapy</span></div>
                            <div><span className="text-gray-400 font-semibold uppercase text-[10px]">BSB</span><span className="font-bold block text-dark">084-004</span></div>
                            <div><span className="text-gray-400 font-semibold uppercase text-[10px]">Account Number</span><span className="font-bold block text-dark">1234 5678 9</span></div>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase text-gray-500">Upload Payment Slip *</label>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    setPaymentSlipFile(file);
                                    setSlipUploadSuccess(false);
                                    handleUploadPaymentSlip(file);
                                  }
                                }}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#799A29]/10 file:text-[#799A29] cursor-pointer"
                              />
                            </div>
                            {uploadingSlip && (
                              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                                <Loader2 size={16} className="animate-spin" /> Uploading receipt slip...
                              </div>
                            )}
                            {slipUploadSuccess && formData.paymentSlipUrl && (
                              <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                                <Check size={16} /> Receipt uploaded successfully!
                              </div>
                            )}
                            <button
                              type="button"
                              disabled={submitLoading || uploadingSlip || (!paymentSlipFile && !formData.paymentSlipUrl)}
                              onClick={handleBankTransferSubmit}
                              className="w-full py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-sm hover:opacity-95 shadow-md shadow-[#799A29]/20 disabled:opacity-50 cursor-pointer"
                            >
                              {submitLoading ? <><Loader2 className="animate-spin" size={18} /> Submitting Payment...</> : "Submit Payment"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* NAVIGATION CONTROLS */}
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    {currentStep > 1 ? (
                      <button type="button" onClick={handlePrev} className="px-5 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer">
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : <div />}

                    {currentStep < 6 ? (
                      <button type="button" onClick={handleNext} className="px-6 py-3 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer border-none">
                        Next Step <ArrowRight size={16} />
                      </button>
                    ) : currentStep === 6 ? (
                      formData.paymentType === "Private" ? (
                        <button type="button" onClick={handleNext} className="px-6 py-3 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer border-none">
                          Proceed to Payment <ArrowRight size={16} />
                        </button>
                      ) : (
                        <button type="button" onClick={handleSubmitDirect} disabled={submitLoading} className="px-8 py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer border-none disabled:opacity-50">
                          {submitLoading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting...</> : <><CheckCircle2 size={16} /> Submit Referral</>}
                        </button>
                      )
                    ) : null}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
