"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, Calendar, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Logo from "@/assets/care-first-logo.png";

const primaryLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Strength & Balance Program", href: "/programs" },
];

const moreSubLinks = [
  { name: "Testimonials", href: "/testimonials" },
  { name: "Contact Us", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
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
          {primaryLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[14px] xl:text-[15px] font-semibold text-dark hover:text-primary transition-colors relative group whitespace-nowrap"
            >
              {link.name}
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          {/* More Dropdown */}
          <div
            className="relative py-2"
            onMouseEnter={() => setMoreDropdownOpen(true)}
            onMouseLeave={() => setMoreDropdownOpen(false)}
          >
            <button
              type="button"
              className="text-[14px] xl:text-[15px] font-semibold text-dark hover:text-primary transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              More
              <ChevronDown
                size={15}
                className={cn(
                  "transition-transform duration-200 text-gray-500 group-hover:text-primary",
                  moreDropdownOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence>
              {moreDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                >
                  {moreSubLinks.map((subLink) => (
                    <Link
                      key={subLink.name}
                      href={subLink.href}
                      className="block px-4 py-2.5 text-xs xl:text-sm font-semibold text-dark hover:text-primary hover:bg-[#FAFBF9] transition-colors"
                      onClick={() => setMoreDropdownOpen(false)}
                    >
                      {subLink.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0 ml-4 lg:ml-6">
          {/* Direct Call Button (Theme Green, Always Open) */}
          <a
            href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
            className="flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white h-11 rounded-full px-4 xl:px-5 shadow-md hover:shadow-primary/30 transition-all duration-300 cursor-pointer shrink-0"
          >
            <Phone size={18} className="shrink-0 text-white" />
            <span className="whitespace-nowrap text-xs xl:text-sm font-semibold tracking-wide">
              {phoneNumber}
            </span>
          </a>

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
              {primaryLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-semibold text-dark hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-gray-200/50">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">More Pages</span>
                <div className="flex flex-col gap-3 pl-2">
                  {moreSubLinks.map((subLink) => (
                    <Link
                      key={subLink.name}
                      href={subLink.href}
                      className="text-base font-semibold text-dark hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {subLink.name}
                    </Link>
                  ))}
                </div>
              </div>

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
