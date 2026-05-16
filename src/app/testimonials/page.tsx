"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const allReviews = [
  {
    name: "John Smith",
    location: "Brisbane North",
    rating: 5,
    comment: "The home visit service was life-changing for my father. Udayamali is incredibly patient and professional. Highly recommend for aged care!",
    service: "Aged Care Physio",
  },
  {
    name: "Sarah Jenkins",
    location: "South Brisbane",
    rating: 5,
    comment: "Excellent NDIS support. They really took the time to understand my goals and create a plan that works for my daily routine.",
    service: "NDIS Physiotherapy",
  },
  {
    name: "Robert Taylor",
    location: "Indooroopilly",
    rating: 5,
    comment: "Joining the Strength & Balance program was the best decision I've made. I feel so much more confident on my feet now.",
    service: "Strength & Balance",
  },
  {
    name: "Emma Wilson",
    location: "Chermside",
    rating: 5,
    comment: "Professional, caring, and very knowledgeable. The mobile service is so convenient for a busy professional like me.",
    service: "Mobile Physio",
  },
  {
    name: "Michael Brown",
    location: "Mount Gravatt",
    rating: 5,
    comment: "Telehealth sessions were surprisingly effective! I was able to get expert advice and exercise supervision without leaving my house.",
    service: "Telehealth",
  },
  {
    name: "Dorothy Miller",
    location: "Ascot",
    rating: 5,
    comment: "A wonderful experience. The team is so respectful and patient with elderly patients. My mobility has improved significantly.",
    service: "Aged Care Physio",
  },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Header */}
      <section className="pt-40 pb-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-dark mb-6"
          >
            Client <span className="text-primary">Stories</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real feedback from our wonderful clients in the Brisbane community. Your success is our greatest reward.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-b border-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 text-center">
          <div>
            <p className="text-3xl font-serif font-bold text-primary">4.9/5</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Average Rating</p>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-primary">500+</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Five Star Reviews</p>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-primary">100%</p>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="section-padding bg-light">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allReviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[48px] shadow-sm relative hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-gray-600 mb-8 italic leading-relaxed text-lg">
                "{review.comment}"
              </p>
              
              <div className="flex items-center justify-between border-t border-light pt-6">
                <div>
                  <h4 className="font-bold text-dark">{review.name}</h4>
                  <p className="text-xs text-gray-400 font-semibold">{review.location}</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className="inline-block px-3 py-1 bg-secondary/50 text-[10px] font-bold text-primary rounded-full uppercase tracking-widest">
                    {review.service}
                   </span>
                   <div className="flex items-center gap-1 mt-2">
                     <CheckCircle2 size={12} className="text-primary" />
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified Client</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Review CTA */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute -top-20 -left-20 text-secondary/40 -z-10">
            <Quote size={200} fill="currentColor" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-dark mb-8">Join Our Success Stories</h2>
          <p className="text-lg text-gray-600 mb-12">
            Are you ready to improve your mobility and regain your independence? Let us help you write your own recovery story.
          </p>
          <Link href="/contact" className="btn-primary">
            Start Your Journey Today
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
