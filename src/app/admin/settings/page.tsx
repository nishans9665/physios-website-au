"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Power, 
  Code, 
  Building2, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Undo,
  Phone,
  Mail,
  MapPin,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom standard brand icons (since Lucide v1.x removed brand icons)
interface BrandIconProps {
  size?: number;
  className?: string;
}

const Facebook = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Linkedin = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Youtube = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // General & Maintenance Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  // Tracking Scripts
  const [googleTagHeader, setGoogleTagHeader] = useState("");
  const [googleTagBody, setGoogleTagBody] = useState("");
  const [googleTagFooter, setGoogleTagFooter] = useState("");

  // Site Contacts
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [clinicHours, setClinicHours] = useState("");

  // Notification Emails
  const [contactLeadEmail, setContactLeadEmail] = useState("");
  const [referralEmail, setReferralEmail] = useState("");

  // Social URLs
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setMaintenanceMode(Boolean(data.maintenanceMode));
        setMaintenanceMessage(data.maintenanceMessage || "");
        setGoogleTagHeader(data.googleTagHeader || "");
        setGoogleTagBody(data.googleTagBody || "");
        setGoogleTagFooter(data.googleTagFooter || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setAddress(data.address || "");
        setClinicHours(data.clinicHours || "");
        setContactLeadEmail(data.contactLeadEmail || "");
        setReferralEmail(data.referralEmail || "");
        setFacebookUrl(data.facebookUrl || "");
        setInstagramUrl(data.instagramUrl || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setYoutubeUrl(data.youtubeUrl || "");
      } else {
        showNotification("error", "Failed to retrieve configuration settings.");
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
      showNotification("error", "Connection error. Failed to load settings.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maintenanceMode,
          maintenanceMessage,
          googleTagHeader,
          googleTagBody,
          googleTagFooter,
          phone,
          email,
          address,
          clinicHours,
          contactLeadEmail,
          referralEmail,
          facebookUrl,
          instagramUrl,
          linkedinUrl,
          youtubeUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification("success", "Global website settings updated successfully!");
        fetchSettings(); // Refresh configurations
      } else {
        showNotification("error", data.error || "Failed to save settings.");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      showNotification("error", "Network failure. Failed to update settings.");
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-serif flex items-center gap-2">
            <Settings className="text-primary" size={26} />
            Global Settings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure maintenance triggers, analytic tags, clinic hours, and social connections.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin text-primary shrink-0" />
          <p className="text-sm font-semibold">Retrieving global configuration records...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* COLUMN 1: Site Status & Social Profiles */}
            <div className="space-y-8">
              
              {/* PANEL 1: Maintenance Mode */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl shrink-0">
                    <Power size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Website Access Status</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Control dynamic Maintenance Mode for public viewers.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-sm font-bold text-dark">Maintenance Mode</span>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      When enabled, all public site visitors are blocked and shown a customized maintenance landing page. Admin dashboards remain fully accessible.
                    </p>
                  </div>
                  
                  {/* Styled Premium Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`w-14 h-8 rounded-full transition-all duration-300 relative focus:outline-none shrink-0 cursor-pointer ${
                      maintenanceMode ? "bg-rose-500" : "bg-gray-300"
                    }`}
                  >
                    <span 
                      className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-all duration-300 transform ${
                        maintenanceMode ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Maintenance Message */}
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Maintenance Mode Message</label>
                  <textarea
                    rows={4}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="We are temporarily offline for planned upgrades. We'll be back shortly!"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary text-sm resize-none"
                    disabled={!maintenanceMode}
                  />
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Leave blank to use the system default message. This is displayed next to clinic contact channels to retain user trust.
                  </p>
                </div>
              </div>

              {/* PANEL 2: Social Media Connect */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Social Media Profiles</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Manage target channels that auto-populate the public footer.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Facebook */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Facebook size={14} className="text-blue-600" /> Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/your-clinic"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Instagram size={14} className="text-pink-600" /> Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/your-clinic"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Linkedin size={14} className="text-blue-700" /> LinkedIn Organization URL
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/your-clinic"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Youtube size={14} className="text-red-600" /> YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/c/your-clinic"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2: Tracking Scripts & Clinic Info */}
            <div className="space-y-8">
              
              {/* PANEL 3: Tracking Scripts */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                    <Code size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Google Analytics & Scripts</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Inject tracking codes (GTM, Pixel, tags) into document templates.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Header Injection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
                      Header tags (inside &lt;head&gt;)
                    </label>
                    <textarea
                      rows={3}
                      value={googleTagHeader}
                      onChange={(e) => setGoogleTagHeader(e.target.value)}
                      placeholder="<!-- Google Tag Manager Header script here -->"
                      className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary resize-y leading-normal"
                    />
                  </div>

                  {/* Body Injection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
                      Body tags (immediately inside &lt;body&gt;)
                    </label>
                    <textarea
                      rows={3}
                      value={googleTagBody}
                      onChange={(e) => setGoogleTagBody(e.target.value)}
                      placeholder="<!-- Google Tag Manager Noscript / body script here -->"
                      className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary resize-y leading-normal"
                    />
                  </div>

                  {/* Footer Injection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
                      Footer tags (right before &lt;/body&gt;)
                    </label>
                    <textarea
                      rows={3}
                      value={googleTagFooter}
                      onChange={(e) => setGoogleTagFooter(e.target.value)}
                      placeholder="<!-- Custom footer scripts or chats here -->"
                      className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary resize-y leading-normal"
                    />
                  </div>
                </div>
              </div>

              {/* PANEL 4: Clinic Info */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Clinic & Contact Details</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Populate global address, phone, and operational timings.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Phone size={14} className="text-primary" /> Clinic Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+61 (0) 400 000 000"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Mail size={14} className="text-primary" /> Clinic Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="info@carefirstphysio.com.au"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  {/* Clinic Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" /> Clinic Physical Address / Service Areas
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Serving Brisbane & surrounding areas, Queensland, Australia"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
                    />
                  </div>

                  {/* Operating Hours */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" /> Operating Hours
                    </label>
                    <textarea
                      rows={3}
                      value={clinicHours}
                      onChange={(e) => setClinicHours(e.target.value)}
                      placeholder="Mon - Fri: 8:00 AM - 6:00 PM&#10;Sat: 9:00 AM - 1:00 PM&#10;Sun: Closed"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* PANEL 5: Notification Emails */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-dark text-base">Notification Emails</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Where should form submissions be sent?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Mail size={14} className="text-primary" /> Contact Form Notification Email
                    </label>
                    <input
                      type="text"
                      value={contactLeadEmail}
                      onChange={(e) => setContactLeadEmail(e.target.value)}
                      placeholder="e.g. leads@yourclinic.com, other@yourclinic.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                      <Mail size={14} className="text-primary" /> Appointment Form Notification Email
                    </label>
                    <input
                      type="text"
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      placeholder="e.g. bookings@yourclinic.com, other@yourclinic.com"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Save bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={submitting}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition-colors cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50"
            >
              <Undo size={16} />
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary text-white hover:bg-primary/95 font-semibold rounded-xl text-sm shadow-md transition-colors cursor-pointer border-none flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
