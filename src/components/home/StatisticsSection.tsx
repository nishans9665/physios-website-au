"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "1500+", label: "Happy Patients" },
  { value: "10+", label: "Years Experience" },
  { value: "500+", label: "Rehabilitation Programs" },
  { value: "2000+", label: "Mobile Sessions" },
];

const StatisticsSection = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h3 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                {stat.value}
              </h3>
              <p className="text-white/70 font-semibold tracking-widest uppercase text-xs">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
