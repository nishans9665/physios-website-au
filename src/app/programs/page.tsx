"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, Calendar, Target, TrendingUp, Users, Home } from "lucide-react";
import Link from "next/link";

const benefits = [
  "Significant reduction in fall risk",
  "Improved muscular strength",
  "Better balance and coordination",
  "Increased bone density",
  "Greater daily independence",
  "Boosted social confidence",
];

const process = [
  {
    step: "01",
    title: "Initial Assessment",
    description: "A comprehensive evaluation of your current mobility, balance, and health history.",
    icon: Calendar,
  },
  {
    step: "02",
    title: "Personalized Goals",
    description: "Setting realistic milestones based on your lifestyle and aspirations.",
    icon: Target,
  },
  {
    step: "03",
    title: "Group Sessions",
    description: "Participate in supportive group exercises led by expert physiotherapists.",
    icon: Users,
  },
  {
    step: "04",
    title: "Home Practice",
    description: "Supplementary exercises to maintain progress between sessions.",
    icon: Home,
  },
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary font-bold uppercase tracking-widest text-sm"
            >
              Signature Program
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif font-bold text-dark mt-4 mb-8"
            >
              Strength & <span className="text-primary">Balance</span> Program
            </motion.h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Empowering older adults to move with confidence. Our evidence-based program is specifically designed to prevent falls and improve mobility through guided group exercise.
            </p>
            <Link href="/contact" className="btn-primary">
              Enroll in Program
            </Link>
          </div>
          <div className="flex-1 relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl">
            <Image
              src="/images/Strength-&-Balance-Program.jpeg"
              alt="Elderly group exercise session"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-serif font-bold text-dark mb-8">Why Join the Program?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="text-primary shrink-0 mt-1" size={20} />
                  <span className="font-semibold text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="bg-secondary/30 p-12 rounded-[60px] border border-accent">
            <TrendingUp className="text-primary mb-6" size={48} />
            <h3 className="text-2xl font-serif font-bold text-dark mb-4">Evidence-Based Results</h3>
            <p className="text-gray-600 leading-relaxed">
              Clinical studies show that targeted strength and balance training can reduce the rate of falls by up to 50% in seniors. Our program follows these proven protocols to ensure safety and effectiveness.
            </p>
          </div>
        </div>
      </section>

      {/* Step by Step Process */}
      <section className="section-padding bg-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-dark">How It Works</h2>
            <p className="text-gray-500 mt-4">Your journey to better mobility starts here.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-white p-8 rounded-[40px] shadow-sm group hover:shadow-xl transition-all"
              >
                <span className="absolute top-6 right-8 text-5xl font-serif font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                  {item.step}
                </span>
                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-4">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Options */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white border-2 border-primary p-10 rounded-[40px] text-center">
              <h3 className="text-2xl font-serif font-bold text-dark mb-2">In-Person Sessions</h3>
              <p className="text-primary font-bold mb-6 tracking-widest uppercase text-xs">Brisbane Community Centers</p>
              <p className="text-gray-600 mb-8">Join our supportive group in person at various locations across Brisbane.</p>
              <Link href="/contact" className="btn-primary inline-block w-full">Join In-Person</Link>
            </div>
            <div className="bg-light p-10 rounded-[40px] text-center">
              <h3 className="text-2xl font-serif font-bold text-dark mb-2">Online Sessions</h3>
              <p className="text-gray-500 font-bold mb-6 tracking-widest uppercase text-xs">Telehealth Options</p>
              <p className="text-gray-600 mb-8">Participate from the comfort of your home with our guided video sessions.</p>
              <Link href="/contact" className="btn-secondary inline-block w-full">Join Online</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
