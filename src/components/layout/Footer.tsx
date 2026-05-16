import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Globe, Share2, MessageSquare } from "lucide-react";
import Logo from "@/assets/care-first-logo.png";

const Footer = () => {
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
          <div className="flex gap-4">
            {[Globe, Share2, MessageSquare].map((Icon, i) => (
              <Link
                key={i}
                href="#"
                className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>


        {/* Quick Links */}
        <div>
          <h3 className="font-serif text-xl font-bold mb-6 text-primary">Quick Links</h3>
          <ul className="space-y-4 text-gray-400">
            {["Home", "About Us", "Testimonials", "Contact Us", "Book Appointment"].map((item) => (
              <li key={item}>
                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
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

        {/* Contact Info */}
        <div>
          <h3 className="font-serif text-xl font-bold mb-6 text-primary">Get In Touch</h3>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start gap-3">
              <MapPin className="text-primary mt-1 shrink-0" size={20} />
              <span>Serving Brisbane & surrounding areas, Queensland, Australia</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-primary shrink-0" size={20} />
              <span>+61 (000) 000 000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-primary shrink-0" size={20} />
              <span>info@carefirstphysio.com.au</span>
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
