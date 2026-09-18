"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  Calendar
} from "lucide-react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const service = searchParams.get("service") || "Physiotherapy Service";
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(data);
        }
      })
      .catch((err) => console.error("Error loading thank you page settings:", err));
  }, []);

  return (
    <div className="bg-[#FAFBF9] min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow max-w-xl w-full mx-auto px-4 py-12 mt-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[40px] border border-gray-100 shadow-xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden"
        >
          {/* Top Decorative Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-[#40B6C0]" />

          {/* Success Animated Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark">
              {name ? `Thank You, ${name}!` : "Thank You!"}
            </h1>
            <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
              We have received your message regarding{" "}
              <span className="font-semibold text-primary">{service}</span>. One of our care coordinators will reach out to you shortly.
            </p>
          </div>

          {/* Compact What Happens Next Box */}
          <div className="bg-[#FAFBF9] border border-gray-100 p-5 rounded-2xl text-left space-y-3 max-w-md mx-auto">
            <h2 className="text-[11px] uppercase font-bold tracking-widest text-gray-400 text-center">
              What Happens Next?
            </h2>
            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <p><span className="font-bold text-dark">Inquiry Logged:</span> Request saved in intake system.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <p><span className="font-bold text-dark">Clinical Review:</span> Matched with physio coordinator.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <p><span className="font-bold text-dark">Intake Call:</span> We will contact you within 24 hours.</p>
              </div>
            </div>
          </div>

          {/* Quick Contact Info */}
          <div className="pt-2 border-t border-gray-100 max-w-md mx-auto">
            <p className="text-[11px] text-gray-400 font-semibold mb-2">Need immediate assistance?</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              <a
                href={`tel:${(settings?.phone || "+61431949491").replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-light hover:bg-secondary/40 rounded-full text-dark transition-colors"
              >
                <Phone size={13} className="text-primary" />
                <span>{settings?.phone || "+61 431 949 491"}</span>
              </a>
              <a
                href={`mailto:${settings?.email || "info@carefirstphysio.com.au"}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-light hover:bg-secondary/40 rounded-full text-dark transition-colors"
              >
                <Mail size={13} className="text-primary" />
                <span>{settings?.email || "info@carefirstphysio.com.au"}</span>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-primary text-white font-bold rounded-full text-xs hover:opacity-95 transition-all inline-flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
            >
              Return Home <ArrowRight size={14} />
            </Link>
            <Link
              href="/referral"
              className="px-6 py-3 bg-button text-white font-bold rounded-full text-xs hover:opacity-95 transition-all inline-flex items-center justify-center gap-1.5 shadow-md shadow-button/20"
            >
              <Calendar size={14} />
              Book Appointment
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
