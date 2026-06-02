"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  UserRound,
  Activity,
  Brain,
  HeartPulse,
  PersonStanding,
  Truck,
  Video,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const mainServices = [
  {
    id: "mobile-physiotherapy",
    title: "Mobile Physiotherapy",
    description: "We bring our expert clinic services directly to the comfort and safety of your home.",
    icon: Truck,
    image: "/images/Mobile Physiotherapy.png",
  },
  {
    id: "telehealth-physiotherapy",
    title: "Telehealth Physiotherapy",
    description: "Professional consultations and exercise supervision via secure video platforms.",
    icon: Video,
    image: "/images/Telehealth_Physiotherapy1.png",
  }
];

const subServices = [
  {
    id: "ndis-physiotherapy",
    title: "NDIS Physiotherapy",
    description: "Specialized rehabilitation and support for NDIS participants to achieve their physical goals.",
    icon: ShieldCheck,
  },
  {
    id: "aged-care-physiotherapy",
    title: "Aged Care Physiotherapy",
    description: "Personalized care for elderly patients focused on maintaining mobility and independence.",
    icon: UserRound,
  },
  {
    id: "musculoskeletal-physiotherapy",
    title: "Musculoskeletal Physiotherapy",
    description: "Treatment for muscle and joint conditions, including back pain, sports injuries, and arthritis.",
    icon: Activity,
  },
  {
    id: "neurological-physiotherapy",
    title: "Neurological Physiotherapy",
    description: "Specialized support for conditions like stroke, Parkinson's, and multiple sclerosis.",
    icon: Brain,
  },
  {
    id: "cardiovascular-physiotherapy",
    title: "Cardiovascular Physiotherapy",
    description: "Rehabilitation programs focusing on heart and lung health and recovery.",
    icon: HeartPulse,
  },
  {
    id: "womens-health",
    title: "Women's Health",
    description: "Dedicated physiotherapy services for pelvic floor health, prenatal and postnatal care.",
    icon: PersonStanding,
  },
  {
    id: "strength-balance",
    title: "Strength & Balance Program",
    description: "Targeted exercise programs designed to improve strength, stability and reduce falls risk.",
    icon: Activity,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-40 pb-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold text-dark mb-6"
          >
            Comprehensive <span className="text-primary">Services</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Personalized physiotherapy care tailored to your specific needs, delivered in the comfort of your home or online.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="section-padding bg-white pb-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            {mainServices.map((service, index) => (
              <motion.div
                id={service.id}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group flex flex-col rounded-[32px] bg-light hover:bg-primary transition-all duration-500 shadow-sm hover:shadow-2xl scroll-mt-32 border border-transparent overflow-hidden"
              >
                <div className="relative w-full h-100 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="p-10 pt-0 flex-1 flex flex-col relative z-10">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary mb-8 shadow-sm group-hover:text-primary transition-all -mt-10 border-4 border-light group-hover:border-primary">
                    <service.icon size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-dark group-hover:text-white mb-6 leading-tight">{service.title}</h2>
                  <p className="text-gray-600 group-hover:text-white/90 text-lg mb-8 leading-relaxed flex-1">
                    {service.description}
                  </p>
                  <Link
                    href="/contact"
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary group-hover:text-white hover:gap-4 transition-all"
                  >
                    Learn More <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sub Services */}
      <section className="section-padding bg-light pt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-dark mb-4">Our Specialties</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These specialized services are available through both our Mobile and Telehealth delivery methods.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subServices.map((service, index) => (
              <motion.div
                id={service.id}
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-accent scroll-mt-32"
              >
                <div className="w-12 h-12 bg-light rounded-xl flex items-center justify-center text-primary mb-4 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                  <service.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-3 leading-tight">{service.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  {service.description}
                </p>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:gap-4 transition-all"
                >
                  Learn More <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding bg-dark text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8">Ready to Start Your Recovery?</h2>
          <p className="text-xl text-gray-400 mb-12">
            Book an initial assessment with our expert physiotherapists today.
          </p>
          <Link href="/referral" className="btn-primary inline-block">
            Book Appointment
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
