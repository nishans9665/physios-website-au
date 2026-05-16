"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCheck, ClipboardList, Microscope, CalendarClock, Zap, HeartPulse } from "lucide-react";

const features = [
  {
    title: "Expert Physiotherapists",
    description: "Highly qualified and experienced professionals dedicated to your recovery.",
    icon: UserCheck,
  },
  {
    title: "Personalized Treatment",
    description: "Custom care plans tailored specifically to your goals and condition.",
    icon: ClipboardList,
  },
  {
    title: "Evidence-Based Therapy",
    description: "Treatments backed by the latest clinical research and healthcare standards.",
    icon: Microscope,
  },
  {
    title: "Flexible Scheduling",
    description: "Home visits and telehealth options that fit into your busy lifestyle.",
    icon: CalendarClock,
  },
  {
    title: "Fast Appointments",
    description: "Minimal waiting times so you can start your recovery journey sooner.",
    icon: Zap,
  },
  {
    title: "Supportive Recovery",
    description: "Compassionate care focused on long-term wellness and independence.",
    icon: HeartPulse,
  },
];

const WhyChooseUs = () => {
  return (
    <section className="section-padding bg-light relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-bold uppercase tracking-widest text-sm"
            >
              Why Choose Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif font-bold text-dark mt-4"
            >
              Experience the Highest Standard of Professional Care
            </motion.h2>
          </div>
          <p className="text-gray-600 max-w-sm">
            We are committed to providing the Brisbane community with accessible, high-quality physiotherapy services.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 group cursor-default"
            >
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
