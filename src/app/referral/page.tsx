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
  FileCheck
} from "lucide-react";

interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  documentType: string;
}

interface SupportWorker {
  name: string;
  phoneNumber: string;
}

const STEPS = [
  "Client Details",
  "Next of Kin",
  "Referrer Info",
  "Payment Details",
  "Appointment Prefs",
  "Medical History",
  "NDIS Details",
  "Support Workers",
  "Goals & Info",
  "File Uploads",
  "Consent & Submit"
];

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Transgender / Non Binary / Gender Diverse",
  "Prefer not to answer"
];

const PAYMENT_OPTIONS = [
  "Private",
  "CHSP Provider",
  "NDIS",
  "Medicare",
  "CDM/EPC",
  "Home Care Package",
  "Other"
];

const APPOINTMENT_TYPES = [
  "Face to Face",
  "Telehealth",
  "No Preference"
];

export default function ReferralPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Client
    client: {
      fullName: "",
      email: "",
      address: "",
      phoneNumber: "",
      dob: "",
      gender: "Prefer not to answer"
    },
    // Step 2: Next of Kin
    contact: {
      contactName: "",
      email: "",
      address: "",
      phoneNumber: ""
    },
    // Step 3: Referrer
    referrer: {
      referrerName: "",
      companyName: "",
      email: "",
      address: "",
      phoneNumber: ""
    },
    // Step 4: Payment
    paymentType: "Private",
    providerName: "",
    invoiceContactName: "",
    coordinatorName: "",
    invoiceEmail: "",
    // Step 5: Appointment Prefs
    preferredAppointmentType: "Face to Face",
    unavailability: "",
    preferredDays: [] as string[],
    preferredTime: "Morning",
    // Step 6: Medical History
    medicalHistory: {
      primaryDiagnosis: "",
      recentFallsSurgeryRisks: "",
      cognitiveDiagnosis: "",
      specificPrecautions: "",
      otherMedicalInfo: ""
    },
    // Step 7: NDIS
    ndisDetails: {
      managementType: "Self Managed",
      planStartDate: "",
      participantId: "",
      planEndDate: "",
      planManagerName: "",
      planManagerContact: "",
      fundingArea: ""
    },
    // Step 8: Support Workers
    supportWorkers: [] as SupportWorker[],
    // Step 9: Goals
    goals: {
      clientGoals: "",
      additionalInfo: ""
    },
    // Step 10: Files
    documents: [] as DocumentMetadata[],
    // Step 11: Consent
    privacyConsent: false,
    contactConsent: false,
    medicalConsent: false
  });

  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // Global support workers roster (loaded from admin DB)
  const [globalWorkers, setGlobalWorkers] = useState<Array<{
    id: string; name: string; phoneNumber: string;
    role: string | null; organisation: string | null;
  }>>([]);
  const [workersLoading, setWorkersLoading] = useState(false);

  useEffect(() => {
    setWorkersLoading(true);
    fetch("/api/support-workers")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) ? setGlobalWorkers(data) : [])
      .catch(() => { })
      .finally(() => setWorkersLoading(false));
  }, []);

  // Check if a global worker is already selected
  const isWorkerSelected = (name: string, phone: string) =>
    formData.supportWorkers.some(
      (w) => w.name === name && w.phoneNumber === phone
    );

  // Pick a global worker (toggle)
  const toggleGlobalWorker = (w: { name: string; phoneNumber: string }) => {
    setFormData((prev) => {
      const already = prev.supportWorkers.some(
        (x) => x.name === w.name && x.phoneNumber === w.phoneNumber
      );
      const updated = {
        ...prev,
        supportWorkers: already
          ? prev.supportWorkers.filter((x) => !(x.name === w.name && x.phoneNumber === w.phoneNumber))
          : [...prev.supportWorkers, { name: w.name, phoneNumber: w.phoneNumber }],
      };
      saveDraft(updated, currentStep);
      return updated;
    });
  };
  const [draftRestored, setDraftRestored] = useState(false);

  // Load and save drafts (Auto-Save Draft premium feature)
  useEffect(() => {
    const savedDraft = localStorage.getItem("physio_referral_draft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed.formData);
        setCurrentStep(parsed.currentStep || 1);
        setDraftRestored(true);
        setTimeout(() => setDraftRestored(false), 5000);
      } catch (e) {
        console.error("Failed to restore draft", e);
      }
    }
  }, []);

  const saveDraft = (updatedForm: typeof formData, step: number) => {
    localStorage.setItem("physio_referral_draft", JSON.stringify({ formData: updatedForm, currentStep: step }));
  };

  const clearDraft = () => {
    localStorage.removeItem("physio_referral_draft");
  };

  const handleNestedChange = (
    section: "client" | "contact" | "referrer" | "medicalHistory" | "ndisDetails" | "goals",
    field: string,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const handleSimpleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  // Support Worker helper
  const addSupportWorker = () => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        supportWorkers: [...prev.supportWorkers, { name: "", phoneNumber: "" }]
      };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const removeSupportWorker = (index: number) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        supportWorkers: prev.supportWorkers.filter((_, idx) => idx !== index)
      };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  const updateSupportWorker = (index: number, field: keyof SupportWorker, value: string) => {
    setFormData((prev) => {
      const workers = [...prev.supportWorkers];
      workers[index] = { ...workers[index], [field]: value };
      const updated = { ...prev, supportWorkers: workers };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  // Preferred days helper
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

  // File Upload Helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setValidationError("");

    const file = fileList[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const docObj: DocumentMetadata = {
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl,
        documentType: type
      };

      setFormData((prev) => {
        const updated = {
          ...prev,
          documents: [...prev.documents, docObj]
        };
        saveDraft(updated, currentStep);
        return updated;
      });
    } catch (err: any) {
      setValidationError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        documents: prev.documents.filter((_, idx) => idx !== index)
      };
      saveDraft(updated, currentStep);
      return updated;
    });
  };

  // Step Validation logic
  const validateStep = (step: number): boolean => {
    setValidationError("");

    switch (step) {
      case 1:
        if (!formData.client.fullName.trim()) return failValidation("Full Name is required.");
        if (!formData.client.email.trim()) return failValidation("Email address is required.");
        if (!formData.client.phoneNumber.trim()) return failValidation("Phone number is required.");
        if (!formData.client.dob) return failValidation("Date of Birth is required.");
        break;
      case 4:
        if (!formData.paymentType) return failValidation("Please select a Payment Type.");
        break;
      case 6:
        if (!formData.medicalHistory.primaryDiagnosis.trim()) return failValidation("Primary Diagnosis is required.");
        break;
      case 7:
        if (formData.paymentType === "NDIS") {
          if (!formData.ndisDetails.participantId?.trim()) return failValidation("NDIS Participant ID is required.");
        }
        break;
      case 9:
        if (!formData.goals.clientGoals.trim()) return failValidation("Please outline the client goals.");
        break;
      case 11:
        if (!formData.privacyConsent || !formData.contactConsent || !formData.medicalConsent) {
          return failValidation("You must check all consents to submit the referral.");
        }
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
      // NDIS Details conditional step skipping logic
      let next = currentStep + 1;
      if (currentStep === 6 && formData.paymentType !== "NDIS") {
        next = 8; // skip Step 7
      }
      setCurrentStep(next);
      saveDraft(formData, next);
    }
  };

  const handlePrev = () => {
    let prev = currentStep - 1;
    if (currentStep === 8 && formData.paymentType !== "NDIS") {
      prev = 6; // skip Step 7 back
    }
    setCurrentStep(prev);
    saveDraft(formData, prev);
  };

  // Master form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(11)) return;

    setSubmitLoading(true);
    setError("");

    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Referral submission failed.");
      }

      clearDraft();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit referral form.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFBF9] min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Banner header */}
      <div className="bg-[#799A29] py-12 mt-26 md:py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider">
            Intake Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white mt-4">
            Online Booking & Referral System
          </h1>
          <p className="text-white/80 text-sm md:text-base mt-2 max-w-xl mx-auto">
            Please fill out this form to coordinate home care visits, NDIS support sessions, and mobile clinical onboarding.
          </p>
        </div>
      </div>

      {/* Main stepper and form cards */}
      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 md:py-12">

        {/* Draft Restored Banner */}
        <AnimatePresence>
          {draftRestored && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl mb-6 flex items-center gap-2 text-sm"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>We found and automatically restored your unfinished referral draft!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation or submission errors */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-2xl mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-2xl mb-6 flex items-center gap-2 text-sm">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stepper Progress bar & Indicators */}
        {!success && (
          <div className="mb-8 md:mb-12 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] px-2 relative">

              {/* Stepper active bar */}
              <div className="absolute top-[18px] left-8 right-8 h-[3px] bg-gray-100 z-0">
                <div
                  className="h-full bg-[#799A29] transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STEPS.map((label, index) => {
                const stepNum = index + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;

                // NDIS dynamic visibility display overrides in stepper
                if (stepNum === 7 && formData.paymentType !== "NDIS") return null;

                return (
                  <div key={label} className="flex flex-col items-center z-10 relative cursor-pointer" onClick={() => {
                    // Allow clicking back to already completed steps
                    if (stepNum < currentStep) {
                      setCurrentStep(stepNum);
                    }
                  }}>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isActive
                        ? "bg-[#799A29] text-white ring-4 ring-[#799A29]/10"
                        : isCompleted
                          ? "bg-[#799A29] text-white"
                          : "bg-white border-2 border-gray-200 text-gray-400"
                        }`}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : stepNum}
                    </div>
                    <span className={`text-[10px] mt-2 font-semibold tracking-wide uppercase ${isActive ? "text-[#799A29]" : "text-gray-400"}`}>
                      {label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Core Contents */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 relative overflow-hidden min-h-[400px]">

          <AnimatePresence mode="wait">
            {success ? (
              // STEP SUCCESS CONFIRMATION
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 md:py-16 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 size={42} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold font-serif text-dark">Referral Submitted Successfully!</h2>
                  <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                    Thank you! Your booking details have been stored securely in our system. A confirmation receipt has been sent to the client’s email inbox.
                  </p>
                </div>
                <div className="bg-[#FAFBF9] border border-gray-100 p-6 rounded-2xl max-w-md mx-auto space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#799A29]">What Happens Next?</h4>
                  <ul className="text-left text-xs text-gray-600 space-y-2 list-disc list-inside">
                    <li>Our coordinator reviews NDIS/plan funding details</li>
                    <li>Clinical team maps precautions & medical diagnosis</li>
                    <li>Intake worker calls you within 1-2 business days to book</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <a
                    href="/"
                    className="inline-flex items-center gap-1 px-6 py-3 bg-[#799A29] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all"
                  >
                    Return to Homepage
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >

                {/* Heading */}
                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-serif text-dark flex items-center gap-2">
                    {currentStep === 1 && <User className="text-[#799A29]" size={22} />}
                    {currentStep === 2 && <User className="text-[#799A29]" size={22} />}
                    {currentStep === 3 && <User className="text-[#799A29]" size={22} />}
                    {currentStep === 4 && <Briefcase className="text-[#799A29]" size={22} />}
                    {currentStep === 5 && <Calendar className="text-[#799A29]" size={22} />}
                    {currentStep === 6 && <Heart className="text-[#799A29]" size={22} />}
                    {currentStep === 7 && <Shield className="text-[#799A29]" size={22} />}
                    {currentStep === 8 && <User className="text-[#799A29]" size={22} />}
                    {currentStep === 9 && <Layers className="text-[#799A29]" size={22} />}
                    {currentStep === 10 && <Upload className="text-[#799A29]" size={22} />}
                    {currentStep === 11 && <FileCheck className="text-[#799A29]" size={22} />}
                    {STEPS[currentStep - 1]}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Progress: Step {currentStep} of {STEPS.length}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* STEP 1: Client Details */}
                  {currentStep === 1 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.client.fullName}
                          onChange={(e) => handleNestedChange("client", "fullName", e.target.value)}
                          placeholder="e.g. John Citizen"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={formData.client.email}
                          onChange={(e) => handleNestedChange("client", "email", e.target.value)}
                          placeholder="e.g. john@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.client.phoneNumber}
                          onChange={(e) => handleNestedChange("client", "phoneNumber", e.target.value)}
                          placeholder="e.g. 0400 000 000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={formData.client.dob}
                          onChange={(e) => handleNestedChange("client", "dob", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Gender Selection *</label>
                        <select
                          value={formData.client.gender}
                          onChange={(e) => handleNestedChange("client", "gender", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        >
                          {GENDER_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Home Address *</label>
                        <textarea
                          rows={3}
                          value={formData.client.address}
                          onChange={(e) => handleNestedChange("client", "address", e.target.value)}
                          placeholder="Please enter street, suburb, and postal code"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Next of Kin / Contact */}
                  {currentStep === 2 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Alternative Contact / NOK Name</label>
                        <input
                          type="text"
                          value={formData.contact.contactName}
                          onChange={(e) => handleNestedChange("contact", "contactName", e.target.value)}
                          placeholder="e.g. Mary Citizen"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NOK Email Address</label>
                        <input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) => handleNestedChange("contact", "email", e.target.value)}
                          placeholder="e.g. mary@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NOK Contact Number</label>
                        <input
                          type="tel"
                          value={formData.contact.phoneNumber}
                          onChange={(e) => handleNestedChange("contact", "phoneNumber", e.target.value)}
                          placeholder="e.g. 0411 111 111"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Postal Address</label>
                        <textarea
                          rows={2}
                          value={formData.contact.address}
                          onChange={(e) => handleNestedChange("contact", "address", e.target.value)}
                          placeholder="Postal details"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Referring Person Details */}
                  {currentStep === 3 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Referrer Name (or Self Referral)</label>
                        <input
                          type="text"
                          value={formData.referrer.referrerName}
                          onChange={(e) => handleNestedChange("referrer", "referrerName", e.target.value)}
                          placeholder="e.g. Dr. Jane Smith"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Referring Clinic / Company</label>
                        <input
                          type="text"
                          value={formData.referrer.companyName}
                          onChange={(e) => handleNestedChange("referrer", "companyName", e.target.value)}
                          placeholder="e.g. Brisbane North GP Clinic"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Referrer Email</label>
                        <input
                          type="email"
                          value={formData.referrer.email}
                          onChange={(e) => handleNestedChange("referrer", "email", e.target.value)}
                          placeholder="e.g. referrals@company.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Referrer Phone Number</label>
                        <input
                          type="tel"
                          value={formData.referrer.phoneNumber}
                          onChange={(e) => handleNestedChange("referrer", "phoneNumber", e.target.value)}
                          placeholder="e.g. 07 3333 4444"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Postal Address</label>
                        <textarea
                          rows={2}
                          value={formData.referrer.address}
                          onChange={(e) => handleNestedChange("referrer", "address", e.target.value)}
                          placeholder="Referring center postal coordinates"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Payment Type & Invoicing */}
                  {currentStep === 4 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Payment Option *</label>
                        <select
                          value={formData.paymentType}
                          onChange={(e) => handleSimpleChange("paymentType", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        >
                          {PAYMENT_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Provider Name (e.g. Home Care / NDIS Plan Manager)</label>
                        <input
                          type="text"
                          value={formData.providerName}
                          onChange={(e) => handleSimpleChange("providerName", e.target.value)}
                          placeholder="e.g. My Care Solution"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Invoice/Accounts Contact Name</label>
                        <input
                          type="text"
                          value={formData.invoiceContactName}
                          onChange={(e) => handleSimpleChange("invoiceContactName", e.target.value)}
                          placeholder="e.g. Accounts Department"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Invoice Coordinator / Care Manager Name</label>
                        <input
                          type="text"
                          value={formData.coordinatorName}
                          onChange={(e) => handleSimpleChange("coordinatorName", e.target.value)}
                          placeholder="e.g. Sarah Connor"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Billing / Invoice Email Address</label>
                        <input
                          type="email"
                          value={formData.invoiceEmail}
                          onChange={(e) => handleSimpleChange("invoiceEmail", e.target.value)}
                          placeholder="e.g. accounts@mycaresolution.com.au"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: Appointment Preferences */}
                  {currentStep === 5 && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Preferred Appointment Method</label>
                        <select
                          value={formData.preferredAppointmentType}
                          onChange={(e) => handleSimpleChange("preferredAppointmentType", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        >
                          {APPOINTMENT_TYPES.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Preferred Consult Time</label>
                        <select
                          value={formData.preferredTime}
                          onChange={(e) => handleSimpleChange("preferredTime", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        >
                          <option value="Morning">Morning (8am - 12pm)</option>
                          <option value="Afternoon">Afternoon (12pm - 4pm)</option>
                          <option value="Evening">Evening (4pm - 7pm)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Preferred Days (Select Multiple)</label>
                        <div className="flex flex-wrap gap-2.5">
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                            const isSelected = formData.preferredDays.includes(day);
                            return (
                              <button
                                type="button"
                                key={day}
                                onClick={() => togglePreferredDay(day)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isSelected
                                  ? "bg-[#799A29]/10 border-[#799A29] text-[#799A29]"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                  }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Specific Unavailability Details</label>
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

                  {/* STEP 6: Medical History */}
                  {currentStep === 6 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Primary Diagnosis / Reasons for Referral *</label>
                        <textarea
                          rows={3}
                          required
                          value={formData.medicalHistory.primaryDiagnosis}
                          onChange={(e) => handleNestedChange("medicalHistory", "primaryDiagnosis", e.target.value)}
                          placeholder="Please specify clinical reasons, physical symptoms, or targeted therapy goals"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Recent Falls, Surgeries, or Balance Risks</label>
                        <textarea
                          rows={2}
                          value={formData.medicalHistory.recentFallsSurgeryRisks}
                          onChange={(e) => handleNestedChange("medicalHistory", "recentFallsSurgeryRisks", e.target.value)}
                          placeholder="Specify date and scope of fall risks, hip/knee replacement dates, etc."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Cognitive Diagnosis (e.g. Dementia, Stroke, MCI)</label>
                        <input
                          type="text"
                          value={formData.medicalHistory.cognitiveDiagnosis}
                          onChange={(e) => handleNestedChange("medicalHistory", "cognitiveDiagnosis", e.target.value)}
                          placeholder="Cognitive factors affecting treatment"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Specific Safety Precautions / Contraindications</label>
                        <textarea
                          rows={2}
                          value={formData.medicalHistory.specificPrecautions}
                          onChange={(e) => handleNestedChange("medicalHistory", "specificPrecautions", e.target.value)}
                          placeholder="Pacemaker, high pressure risk, osteoporosis precautions, etc."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Other Relevant Medical Conditions</label>
                        <textarea
                          rows={2}
                          value={formData.medicalHistory.otherMedicalInfo}
                          onChange={(e) => handleNestedChange("medicalHistory", "otherMedicalInfo", e.target.value)}
                          placeholder="Cardiovascular history, arthritis details, etc."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 7: NDIS Participant Details (CONDITIONAL) */}
                  {currentStep === 7 && formData.paymentType === "NDIS" && (
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NDIS Management Type *</label>
                        <select
                          value={formData.ndisDetails.managementType}
                          onChange={(e) => handleNestedChange("ndisDetails", "managementType", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        >
                          <option value="Self Managed">Self Managed</option>
                          <option value="Agency Managed">Agency Managed</option>
                          <option value="Plan Managed">Plan Managed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Participant NDIS Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.ndisDetails.participantId}
                          onChange={(e) => handleNestedChange("ndisDetails", "participantId", e.target.value)}
                          placeholder="e.g. 430000000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NDIS Plan Start Date</label>
                        <input
                          type="date"
                          value={formData.ndisDetails.planStartDate}
                          onChange={(e) => handleNestedChange("ndisDetails", "planStartDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">NDIS Plan End Date</label>
                        <input
                          type="date"
                          value={formData.ndisDetails.planEndDate}
                          onChange={(e) => handleNestedChange("ndisDetails", "planEndDate", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors text-gray-700 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Plan Manager Name (if Plan Managed)</label>
                        <input
                          type="text"
                          value={formData.ndisDetails.planManagerName}
                          onChange={(e) => handleNestedChange("ndisDetails", "planManagerName", e.target.value)}
                          placeholder="e.g. Plan Partners"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Plan Manager Contact details</label>
                        <input
                          type="text"
                          value={formData.ndisDetails.planManagerContact}
                          onChange={(e) => handleNestedChange("ndisDetails", "planManagerContact", e.target.value)}
                          placeholder="e.g. email or phone number"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Funding Area Allocation (e.g. CB Daily Activities)</label>
                        <input
                          type="text"
                          value={formData.ndisDetails.fundingArea}
                          onChange={(e) => handleNestedChange("ndisDetails", "fundingArea", e.target.value)}
                          placeholder="Therapeutic Supports, Improved Daily Living, etc."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 8: Support Workers — Pick from roster OR add manually */}
                  {currentStep === 8 && (
                    <div className="space-y-6">

                      {/* ── Section A: Global Roster Picker ── */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-dark">Select from Available Workers</h4>
                            <p className="text-xs text-gray-400 mt-0.5">Click a worker to add them to this referral.</p>
                          </div>
                          {workersLoading && (
                            <span className="text-[11px] text-gray-400 animate-pulse">Loading roster…</span>
                          )}
                        </div>

                        {!workersLoading && globalWorkers.length === 0 && (
                          <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl text-gray-400 bg-gray-50/50">
                            <p className="text-xs">No support workers in the roster yet.</p>
                            <p className="text-[11px] text-gray-400 mt-1">An admin can add them via the Support Workers management page.</p>
                          </div>
                        )}

                        {globalWorkers.length > 0 && (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {globalWorkers.map((gw) => {
                              const selected = isWorkerSelected(gw.name, gw.phoneNumber);
                              return (
                                <button
                                  key={gw.id}
                                  type="button"
                                  onClick={() => toggleGlobalWorker(gw)}
                                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all w-full cursor-pointer ${selected
                                    ? "border-[#799A29] bg-[#799A29]/5"
                                    : "border-gray-200 bg-white hover:border-[#799A29]/40 hover:bg-gray-50/60"
                                    }`}
                                >
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${selected ? "bg-[#799A29] text-white" : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {selected ? <CheckCircle2 size={18} /> : gw.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-sm font-semibold truncate ${selected ? "text-[#799A29]" : "text-dark"}`}>{gw.name}</p>
                                    <p className="text-[11px] text-gray-400 truncate">
                                      {[gw.role, gw.organisation].filter(Boolean).join(" · ") || gw.phoneNumber}
                                    </p>
                                  </div>
                                  {selected && (
                                    <span className="text-[10px] font-bold text-[#799A29] shrink-0">✓ Added</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* ── Divider ── */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">or add manually</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* ── Section B: Manual Add Button ── */}
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Worker not in the roster? Enter their details manually below.
                        </p>
                        <button
                          type="button"
                          onClick={addSupportWorker}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#799A29] text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer border-none"
                        >
                          <Plus size={14} /> Add Manually
                        </button>
                      </div>

                      {/* ── Selected & Manual Workers List ── */}
                      {formData.supportWorkers.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-[#799A29]">Workers on this referral ({formData.supportWorkers.length})</p>
                          {formData.supportWorkers.map((worker, index) => {
                            const isFromRoster = globalWorkers.some(
                              (gw) => gw.name === worker.name && gw.phoneNumber === worker.phoneNumber
                            );
                            return (
                              <div key={index} className={`flex gap-3 items-start p-3.5 rounded-2xl border ${isFromRoster ? "border-[#799A29]/30 bg-[#799A29]/5" : "border-gray-100 bg-gray-50"
                                }`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${isFromRoster ? "bg-[#799A29] text-white" : "bg-gray-200 text-gray-600"
                                  }`}>
                                  {worker.name ? worker.name.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-grow">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={worker.name}
                                      onChange={(e) => updateSupportWorker(index, "name", e.target.value)}
                                      placeholder="Support worker name"
                                      readOnly={isFromRoster}
                                      className={`w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-[#799A29] focus:outline-none ${isFromRoster ? "bg-[#799A29]/5 text-[#799A29] font-semibold cursor-default" : "bg-white"
                                        }`}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Contact Number</label>
                                    <input
                                      type="tel"
                                      value={worker.phoneNumber}
                                      onChange={(e) => updateSupportWorker(index, "phoneNumber", e.target.value)}
                                      placeholder="Phone number"
                                      readOnly={isFromRoster}
                                      className={`w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-[#799A29] focus:outline-none ${isFromRoster ? "bg-[#799A29]/5 text-[#799A29] font-semibold cursor-default" : "bg-white"
                                        }`}
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSupportWorker(index)}
                                  className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border-none mt-1 shrink-0"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {formData.supportWorkers.length === 0 && (
                        <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl text-gray-400 bg-gray-50/50">
                          <User size={28} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-xs">No support workers added to this referral yet.</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Pick from the roster above or click "Add Manually".</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 9: Goals & Additional Details */}
                  {currentStep === 9 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Client Therapy Goals *</label>
                        <textarea
                          rows={4}
                          required
                          value={formData.goals.clientGoals}
                          onChange={(e) => handleNestedChange("goals", "clientGoals", e.target.value)}
                          placeholder="e.g. Improve gait patterns, build muscle strength after surgical recovery, reduce risk of falls during outdoor activities"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Other Relevant Information</label>
                        <textarea
                          rows={3}
                          value={formData.goals.additionalInfo}
                          onChange={(e) => handleNestedChange("goals", "additionalInfo", e.target.value)}
                          placeholder="Any details on support structures, home environments, or coordinate parameters to note"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-[#799A29] focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 10: File Uploads */}
                  {currentStep === 10 && (
                    <div className="space-y-6">
                      <div className="bg-[#FAFBF9] border border-[#799A29]/10 p-5 rounded-2xl text-[#799A29] flex items-start gap-3">
                        <Shield className="shrink-0 mt-0.5" size={18} />
                        <div className="text-xs space-y-1">
                          <p className="font-bold">Medical Attachment Guidelines:</p>
                          <p className="opacity-90">Please upload copies of relevant GP referral sheets, NDIS support plans, or previous hospital discharge papers to optimize clinic intake. Max size: 10MB per file.</p>
                        </div>
                      </div>

                      {/* File Uploader triggers */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Referral Sheet", type: "referral" },
                          { label: "Medical Report", type: "medical" },
                          { label: "Assessment Result", type: "assessment" },
                          { label: "NDIS Document", type: "ndis" }
                        ].map((category) => (
                          <label
                            key={category.type}
                            className={`flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-2xl bg-white hover:border-[#799A29] hover:bg-[#799A29]/5 cursor-pointer text-center transition-all ${uploading ? "opacity-55 pointer-events-none" : ""
                              }`}
                          >
                            <Upload size={20} className="text-gray-400 mb-1.5" />
                            <span className="text-[10px] font-bold text-gray-600 block">{category.label}</span>
                            <span className="text-[8px] text-gray-400 block mt-0.5">PDF, DOCX, Images</span>
                            <input
                              type="file"
                              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, category.type)}
                              className="hidden"
                            />
                          </label>
                        ))}
                      </div>

                      {/* Upload Loading Spinner */}
                      {uploading && (
                        <div className="flex items-center justify-center gap-2 text-[#799A29] text-xs font-semibold">
                          <span className="animate-spin w-4 h-4 border-2 border-[#799A29] border-t-transparent rounded-full" />
                          Uploading document to local file store...
                        </div>
                      )}

                      {/* Uploaded Files list */}
                      {formData.documents.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase text-gray-500">Uploaded Documents ({formData.documents.length})</h4>
                          <div className="space-y-2">
                            {formData.documents.map((doc, index) => (
                              <div key={index} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <FileText className="text-[#799A29] shrink-0" size={18} />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-dark truncate" title={doc.fileName}>{doc.fileName}</p>
                                    <p className="text-[9px] text-[#799A29] font-semibold uppercase tracking-wider mt-0.5">{doc.documentType} Document</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border-none"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 11: Consent & Submission */}
                  {currentStep === 11 && (
                    <div className="space-y-6">
                      <div className="bg-[#FAFBF9] border border-gray-100 p-6 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold uppercase text-[#799A29] tracking-wider">Clinical Consent Agreements</h4>

                        {/* Consent Checkboxes */}
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.privacyConsent}
                              onChange={(e) => handleSimpleChange("privacyConsent", e.target.checked)}
                              className="mt-1 w-4 h-4 rounded text-[#799A29] border-gray-300 focus:ring-[#799A29] cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 leading-relaxed">
                              I agree to the <strong>Privacy Policy</strong>. I understand that the personal, contact, and medical details entered above are treated in strict confidence according to Australian health privacy standards. *
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.contactConsent}
                              onChange={(e) => handleSimpleChange("contactConsent", e.target.checked)}
                              className="mt-1 w-4 h-4 rounded text-[#799A29] border-gray-300 focus:ring-[#799A29] cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 leading-relaxed">
                              I consent to clinical staff <strong>contacting</strong> the client, alternative contact (Next of Kin), or referring medical practitioners directly to schedule booking appointments. *
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.medicalConsent}
                              onChange={(e) => handleSimpleChange("medicalConsent", e.target.checked)}
                              className="mt-1 w-4 h-4 rounded text-[#799A29] border-gray-300 focus:ring-[#799A29] cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 leading-relaxed">
                              I confirm that all entered <strong>medical history</strong>, diagnoses, and safety precaution items are true and correct to the best of my knowledge. *
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="text-center py-4 bg-gray-50 border border-gray-100 rounded-2xl">
                        <p className="text-[11px] text-gray-500 font-semibold">
                          Click "Submit Referral" below to sync records with the Care First database and alert the clinical team.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION CONTROLS */}
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">

                    {/* Back Button */}
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="px-5 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={16} /> Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* Next / Submit Button */}
                    {currentStep < 11 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-3 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer border-none"
                      >
                        Next Step <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="px-8 py-3.5 bg-[#799A29] text-white font-bold rounded-xl text-xs md:text-sm flex items-center gap-1.5 hover:opacity-95 transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitLoading ? (
                          <>
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Submitting Referral...
                          </>
                        ) : (
                          <>
                            Submit Referral <CheckCircle2 size={16} />
                          </>
                        )}
                      </button>
                    )}

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
