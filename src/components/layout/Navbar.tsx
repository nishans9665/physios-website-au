"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Logo from "@/assets/care-first-logo.png";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Strength & Balance Program", href: "/programs" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "Contact Us", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+61 431 949 491");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.phone && data.phone.trim() !== "" && data.phone !== "+61 (000) 000 000") {
          setPhoneNumber(data.phone);
        }
      })
      .catch((err) => console.error("Error loading navbar phone number:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass py-3 shadow-md" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Image
            src={Logo}
            alt="The Care First Physiotherapy"
            width={280}
            height={120}
            className="h-16 md:h-18 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[14px] xl:text-[15px] font-semibold text-dark hover:text-primary transition-colors relative group whitespace-nowrap"
            >
              {link.name}
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 ml-4 lg:ml-6">
          {/* Direct Call Button (Theme Green, Icon default, expands smoothly on Hover) */}
          <div className="group relative flex items-center shrink-0">
            <a
              href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white h-11 rounded-full px-3.5 group-hover:px-5 shadow-md hover:shadow-primary/30 transition-all duration-300 ease-out overflow-hidden max-w-[44px] group-hover:max-w-[210px] cursor-pointer shrink-0"
            >
              <Phone size={18} className="shrink-0 text-white transition-transform duration-300 group-hover:scale-110" />
              <span className="whitespace-nowrap text-xs xl:text-sm font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                {phoneNumber}
              </span>
            </a>
          </div>

          {/* Book Appointment Button (Calendar Icon) */}
          <Link href="/referral" className="btn-primary flex items-center gap-2 text-xs xl:text-sm px-5 xl:px-7 py-2.5 shrink-0">
            <Calendar size={18} />
            Book Appointment
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-dark p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/20 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-semibold text-dark hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Direct Call Button Mobile */}
              <a
                href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
                className="flex items-center justify-center gap-2 text-base font-semibold text-white bg-primary hover:bg-primary/90 py-3 rounded-full shadow-md transition-all duration-300 mt-2"
                onClick={() => setIsOpen(false)}
              >
                <Phone size={18} />
                <span>Call: {phoneNumber}</span>
              </a>

              <Link
                href="/referral"
                className="btn-primary flex items-center justify-center gap-2 text-center"
                onClick={() => setIsOpen(false)}
              >
                <Calendar size={18} />
                Book Appointment
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
