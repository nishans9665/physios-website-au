"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Phone, 
  Mail, 
  MapPin
} from "lucide-react";
import Logo from "@/assets/care-first-logo.png";

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

interface FooterProps {
  initialSettings?: {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
  };
}

const fallbackSettings = {
  phone: "+61 (000) 000 000",
  email: "info@carefirstphysio.com.au",
  address: "Serving Brisbane & surrounding areas, Queensland, Australia",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  linkedinUrl: "https://linkedin.com",
  youtubeUrl: "https://youtube.com",
};

const Footer = ({ initialSettings }: FooterProps) => {
  const [settings, setSettings] = useState(() => {
    return {
      phone: initialSettings?.phone || fallbackSettings.phone,
      email: initialSettings?.email || fallbackSettings.email,
      address: initialSettings?.address || fallbackSettings.address,
      facebookUrl: initialSettings?.facebookUrl || fallbackSettings.facebookUrl,
      instagramUrl: initialSettings?.instagramUrl || fallbackSettings.instagramUrl,
      linkedinUrl: initialSettings?.linkedinUrl || fallbackSettings.linkedinUrl,
      youtubeUrl: initialSettings?.youtubeUrl || fallbackSettings.youtubeUrl,
    };
  });

  useEffect(() => {
    // If initialSettings are already provided, do not re-fetch
    if (initialSettings && Object.keys(initialSettings).length > 0) return;

    // Fetch dynamically (perfect for client-rendered pages)
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            phone: data.phone || fallbackSettings.phone,
            email: data.email || fallbackSettings.email,
            address: data.address || fallbackSettings.address,
            facebookUrl: data.facebookUrl || fallbackSettings.facebookUrl,
            instagramUrl: data.instagramUrl || fallbackSettings.instagramUrl,
            linkedinUrl: data.linkedinUrl || fallbackSettings.linkedinUrl,
            youtubeUrl: data.youtubeUrl || fallbackSettings.youtubeUrl,
          });
        }
      })
      .catch((err) => console.error("Error loading footer settings in client context:", err));
  }, [initialSettings]);

  return (
    <footer className="bg-dark text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src={Logo} 
              alt="The Care First Physiotherapy" 
              width={280} 
              height={120} 
              className="h-24 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Providing convenient mobile and telehealth physiotherapy services across Brisbane with personalised care focused on recovery, mobility, strength, and independence.
          </p>
          
          {/* Dynamic Social Links */}
          <div className="flex gap-4">
            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300"
                title="Follow us on Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300"
                title="Follow us on Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {settings.linkedinUrl && (
              <a
                href={settings.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300"
                title="Connect on LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            )}
            {settings.youtubeUrl && (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary text-white transition-all duration-300"
                title="Subscribe on YouTube"
              >
                <Youtube size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-serif text-xl font-bold mb-6 text-primary">Quick Links</h3>
          <ul className="space-y-4 text-gray-400">
            {[
              { name: "Home", href: "/" },
              { name: "About Us", href: "/about" },
              { name: "Testimonials", href: "/testimonials" },
              { name: "Contact Us", href: "/contact" },
              { name: "Book Appointment", href: "/referral" }
            ].map((item) => (
              <li key={item.name}>
                <Link href={item.href} className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Services */}
        <div>
          <h3 className="font-serif text-xl font-bold mb-6 text-primary">Our Services</h3>
          <ul className="space-y-4 text-gray-400">
            {[
              "NDIS Physiotherapy",
              "Aged Care Physiotherapy",
              "Strength & Balance",
              "Mobile Physio Brisbane",
              "Telehealth Services",
              "Musculoskeletal Care"
            ].map((service) => (
              <li key={service}>
                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info (Dynamically Loaded) */}
        <div>
          <h3 className="font-serif text-xl font-bold mb-6 text-primary">Get In Touch</h3>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start gap-3 text-sm">
              <MapPin className="text-primary mt-1 shrink-0" size={18} />
              <span>{settings.address || "Serving Brisbane & surrounding areas, Queensland, Australia"}</span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Phone className="text-primary shrink-0" size={18} />
              <a href={`tel:${settings.phone}`} className="hover:text-primary transition-colors">
                {settings.phone || "+61 (000) 000 000"}
              </a>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <Mail className="text-primary shrink-0" size={18} />
              <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">
                {settings.email || "info@carefirstphysio.com.au"}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
        <p>© {new Date().getFullYear()} The Care First Physiotherapy Service. All rights reserved. | Brisbane, Australia</p>
      </div>
    </footer>
  );
};

export default Footer;
