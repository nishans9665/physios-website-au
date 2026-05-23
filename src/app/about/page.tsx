"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Shield, Users, Target, Award } from "lucide-react";

const values = [
  {
    title: "Compassion First",
    description: "We treat every client with the same care and respect we would show our own family.",
    icon: Heart,
  },
  {
    title: "Clinical Excellence",
    description: "Our treatments are evidence-based and delivered to the highest professional standards.",
    icon: Award,
  },
  {
    title: "Empowering Lives",
    description: "We focus on mobility and strength to help you live a more independent life.",
    icon: Target,
  },
  {
    title: "Community Focused",
    description: "Proudly serving the Brisbane community with accessible mobile healthcare.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-serif font-bold text-dark mb-6"
          >
            About The <span className="text-primary">Care First <br></br>Physiotherapy Service</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Founded on the principle that healthcare should be accessible, compassionate, and personalized. We bring professional physiotherapy directly to you.
          </p>
        </div> 
      </section> 

      {/* Founder Section */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative w-full aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl">
            <Image
              src="/images/about-physio.png"
              alt="Udayamali Pathirana"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-4xl font-serif font-bold text-dark mb-6">Our Founder’s Vision</h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Udayamali Pathirana established The Care First Physiotherapy Service after seeing a growing need for high-quality, mobile-based physiotherapy for the elderly and NDIS participants in Brisbane.
              </p>
              <p>
                With years of experience in various Australian healthcare settings, she realized that the most effective therapy often happens in the environment where the client feels most comfortable: their own home.
              </p>
              <p>
                &quot;My goal is to provide a service that doesn&apos;t just treat symptoms, but empowers people to regain their mobility, strength, and confidence to live their lives to the fullest.&quot;
              </p>
            </div>
            <div className="mt-10 p-8 bg-secondary/30 rounded-[40px] border border-accent">
              <h4 className="font-bold text-primary uppercase tracking-widest text-xs mb-2">Qualifications</h4>
              <ul className="text-sm font-bold text-dark space-y-2">
                <li className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Registered Physiotherapist
                </li>
                <li className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Member of Australian Physiotherapy Association
                </li>
                <li className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" /> Specialized in Geriatric Rehabilitation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-dark">Our Core Values</h2>
            <p className="text-gray-500 mt-4">The pillars of our service commitment.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[40px] shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-4">{value.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-primary text-white p-12 rounded-[60px] shadow-xl">
            <h3 className="text-3xl font-serif font-bold mb-6">Our Mission</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              To provide high-quality, evidence-based physiotherapy services that are accessible, compassionate, and tailored to the unique needs of each individual, helping them achieve their health and wellness goals.
            </p>
          </div>
          <div className="bg-dark text-white p-12 rounded-[60px] shadow-xl">
            <h3 className="text-3xl font-serif font-bold mb-6 text-accent">Our Vision</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              To be Brisbane&apos;s leading mobile physiotherapy service, recognized for our commitment to excellence, client empowerment, and positive health outcomes in the community.
            </p>
          </div>
        </div>
      </section>

      {/* Simple Gallery Preview */}
      <section className="section-padding bg-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-dark">Our Practice in Action</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg">
              <Image src="/images/hero.png" alt="Physio action" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg">
              <Image src="/images/gallery-home.png" alt="Home visit" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg">
              <Image src="/images/gallery-telehealth.png" alt="Telehealth" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
