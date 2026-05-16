"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Strength & Balance Program",
    description: "Our specialized group exercise program designed to improve mobility, prevent falls, and build confidence in older adults.",
    icon: Activity,
    color: "bg-primary",
    href: "/programs",
    features: ["Fall Prevention", "Mobility Training", "Group Environment"],
  },
  {
    title: "NDIS Physiotherapy Services",
    description: "Dedicated support for NDIS participants, focusing on personalized rehabilitation and enhancing independence at home.",
    icon: ShieldCheck,
    color: "bg-accent",
    href: "/services",
    features: ["Registered Provider", "In-home Care", "Goal Oriented"],
  },
];

const FeaturedServices = () => {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/50 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm"
          >
            Our Primary Focus
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-dark mt-4"
          >
            Specialized Care for Your Needs
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group p-8 md:p-12 rounded-[40px] bg-secondary/30 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-accent"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 transition-transform group-hover:scale-110", service.color)}>
                <service.icon size={32} />
              </div>
              
              <h3 className="text-3xl font-serif font-bold text-dark mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                {service.description}
              </p>

              <ul className="space-y-3 mb-10">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-semibold text-dark">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={service.href}
                className="inline-flex items-center gap-2 font-bold text-primary hover:gap-4 transition-all"
              >
                Learn More <ArrowRight size={20} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
