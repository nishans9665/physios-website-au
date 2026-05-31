"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, Award, Heart, Briefcase } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* Image side */}
        <div className="flex-1 relative w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative z-10 rounded-[60px] overflow-hidden aspect-[4/5] shadow-2xl"
          >
            <Image
              src="/images/Udayamali_Pathirana.jpeg"
              alt="Udayamali Pathirana - Lead Physiotherapist"
              fill
              className="object-cover"
            />
          </motion.div>
           
          {/* Experience Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-12 -left-8 bg-primary text-white p-6 rounded-[32px] shadow-xl z-20 hidden md:block"
          >
            <p className="text-4xl font-serif font-bold">10+</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Years Experience</p>
          </motion.div>

          <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl -z-10" />
        </div>

        {/* Content side */}
        <div className="flex-1">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm"
          >
            About Our Founder
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-dark mt-4 mb-6"
          >
            Meet Udayamali Pathirana
          </motion.h2>
          
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed mb-10">
            <p>
              With extensive experience in the Australian healthcare system, Udayamali Pathirana founded The Care First Physiotherapy Service with a simple mission: to provide compassionate, high-quality care that truly puts the client first.
            </p>
            <p>
              Her approach combines clinical excellence with a friendly, compassionate touch, ensuring that every patient receives the personalized attention they deserve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: GraduationCap, text: "Clinical Excellence" },
              { icon: Briefcase, text: "Australian Experience" },
              { icon: Award, text: "Qualified Professional" },
              { icon: Heart, text: "Compassionate Care" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-secondary"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-dark text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
