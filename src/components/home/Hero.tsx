"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, MessageSquare, Calendar, ShieldCheck, Truck, Video, UserRound } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";
import hero1 from "@/assets/hero/hero-1.png";
import hero2 from "@/assets/hero/hero-2.png";
import hero3 from "@/assets/hero/hero-3.png";
import hero4 from "@/assets/hero/gallery-home.png";

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const floatingBadges = [
    { icon: ShieldCheck, text: "NDIS Support" },
    { icon: Truck, text: "Mobile Physio" },
    { icon: Video, text: "Telehealth" },
    { icon: UserRound, text: "Elder Care" },
  ];

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-light">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary rounded-l-[100px] -z-10 hidden lg:block" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
        {/* Content */}
        <div className="flex-1 w-full text-center lg:text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider uppercase text-primary bg-primary/10 rounded-full">
              Your Care Is Our Priority
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-dark mb-6 leading-[1.1]">
              Client-Centered Flexible <span className="text-primary">Physiotherapy</span> Service
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Provide convenient mobile and telehealth physiotherapy services across Brisbane with personalised care focused on recovery, mobility, strength, and independence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full max-w-[280px] sm:max-w-none mx-auto lg:mx-0">
              <Link href="/referral" className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
                <Calendar size={20} />
                Book Appointment
              </Link>
              <Link href="/contact" className="btn-secondary flex items-center justify-center w-full sm:w-auto text-center">
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {floatingBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex flex-col items-center lg:items-start gap-2"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary">
                  <badge.icon size={24} />
                </div>
                <span className="text-xs font-bold text-dark uppercase tracking-tight">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="flex-1 relative w-full mb-10 lg:mb-0 lg:mt-0 order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 w-full"
          >
            <div className="relative w-full aspect-square md:aspect-[4/5] max-w-lg mx-auto rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
              <div className="absolute inset-0">
                {!mounted ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={hero1}
                      alt="Physiotherapy service"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <Swiper
                    modules={[Autoplay, EffectFade]}
                    effect="fade"
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={true}
                    className="w-full h-full"
                  >
                    {[
                      hero1,
                      hero2,
                      hero3,
                      hero4
                    ].map((src, index) => (
                      <SwiperSlide key={index} className="w-full h-full relative">
                        <Image
                          src={src}
                          alt={`Physiotherapy service image ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>

            {/* Floating Contact Icons */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary z-20 cursor-pointer hover:scale-110 transition-transform"
            >
              <MessageSquare size={28} />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-1/2 -left-8 w-14 h-14 bg-primary rounded-2xl shadow-xl flex items-center justify-center text-white z-20 cursor-pointer hover:scale-110 transition-transform"
            >
              <Phone size={24} />
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 right-12 bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 z-20"
            >
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 leading-none mb-1">Service</p>
                <p className="text-sm font-bold text-dark leading-none">Brisbane Local</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
