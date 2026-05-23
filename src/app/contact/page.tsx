"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    serviceInterest: "NDIS Physiotherapy",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<any>(null);

  React.useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error loading contact settings:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccess(true);
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          serviceInterest: "NDIS Physiotherapy",
          message: "",
        });
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Failed to submit form. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-light">
      <Navbar />

      {/* Header */}
      <section className="pt-40 pb-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold text-dark mb-6"
          >
            Get In <span className="text-primary">Touch</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're here to help you on your journey to recovery. Reach out to book an appointment or ask any questions.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-dark mb-10">Contact Information</h2>

            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <a
                href={`tel:${settings?.phone || ""}`}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer block group"
              >
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">Call Us</h3>
                <p className="text-gray-500 text-sm font-semibold truncate">{settings?.phone || "+61431949491"}</p>
              </a>

              <a
                href={`mailto:${settings?.email || ""}`}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer block group"
              >
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">Email Us</h3>
                <p className="text-gray-500 text-sm font-semibold truncate">{settings?.email || "info@thecarefirstphysiotherapyservice.com.au"}</p>
              </a>

              <a
                href={`https://wa.me/${(settings?.phone || "").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer block group"
              >
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">WhatsApp</h3>
                <p className="text-gray-500 text-sm font-semibold truncate">{settings?.phone || "+61431949491"}</p>
              </a>

              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">Operating Hours</h3>
                <p className="text-gray-500 text-xs font-bold text-primary whitespace-pre-line">{settings?.clinicHours || "Mon - Fri: 7:00am - 4:30pm Sat: 9:00 AM - 5:00 PM"}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm flex items-start gap-6">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-dark mb-2">Telehealth service</h3>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
                  {settings?.address || "Join via online from anywhere in Australia"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 md:p-12 rounded-[60px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <h2 className="text-3xl font-serif font-bold text-dark mb-8">Send Us a Message</h2>

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-emerald-800 overflow-hidden"
                >
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                    <p className="text-xs text-emerald-600 mt-0.5">Thank you for reaching out. A care expert will be in touch with you shortly.</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-800 overflow-hidden"
                >
                  <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-sm">Submission Failed</h4>
                    <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+61 000 000 000"
                    className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Service Required</label>
                <div className="relative">
                  <select
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                  >
                    <option value="NDIS Physiotherapy">NDIS Physiotherapy</option>
                    <option value="Aged Care Physiotherapy">Aged Care Physiotherapy</option>
                    <option value="Strength & Balance Program">Strength & Balance Program</option>
                    <option value="General Physiotherapy">General Physiotherapy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Message</label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
