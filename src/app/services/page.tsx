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

const services = [
  {
    title: "NDIS Physiotherapy",
    description: "Specialized rehabilitation and support for NDIS participants to achieve their physical goals.",
    icon: ShieldCheck,
  },
  {
    title: "Aged Care Physiotherapy",
    description: "Personalized care for elderly patients focused on maintaining mobility and independence.",
    icon: UserRound,
  },
  {
    title: "Musculoskeletal Physiotherapy",
    description: "Treatment for muscle and joint conditions, including back pain, sports injuries, and arthritis.",
    icon: Activity,
  },
  {
    title: "Neurological Physiotherapy",
    description: "Specialized support for conditions like stroke, Parkinson's, and multiple sclerosis.",
    icon: Brain,
  },
  {
    title: "Cardiovascular Physiotherapy",
    description: "Rehabilitation programs focusing on heart and lung health and recovery.",
    icon: HeartPulse,
  },
  {
    title: "Women’s Health",
    description: "Dedicated physiotherapy services for pelvic floor health, prenatal and postnatal care.",
    icon: PersonStanding,
  },
  {
    title: "Mobile Physiotherapy",
    description: "We bring our expert clinic services directly to the comfort and safety of your home.",
    icon: Truck,
  },
  {
    title: "Telehealth Physiotherapy",
    description: "Professional consultations and exercise supervision via secure video platforms.",
    icon: Video,
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

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-[32px] bg-light hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-accent"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                  <service.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-4 leading-tight">{service.title}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
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
