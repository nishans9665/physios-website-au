"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "John Smith",
    rating: 5,
    comment: "The home visit service was life-changing for my father. Udayamali is incredibly patient and professional. Highly recommend for aged care!",
    date: "2 months ago",
  },
  {
    name: "Sarah Jenkins",
    rating: 5,
    comment: "Excellent NDIS support. They really took the time to understand my goals and create a plan that works for my daily routine.",
    date: "1 month ago",
  },
  {
    name: "Robert Taylor",
    rating: 5,
    comment: "Joining the Strength & Balance program was the best decision I've made. I feel so much more confident on my feet now.",
    date: "3 weeks ago",
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm"
          >
            What Our Clients Say
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-dark mt-4"
          >
            Trusted by the Brisbane Community
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-secondary/20 p-8 rounded-[40px] relative hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute top-8 right-8 text-primary/20">
                <Quote size={48} fill="currentColor" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-primary text-primary" />
                ))}
              </div>

              <p className="text-gray-600 mb-8 italic leading-relaxed">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-dark">{review.name}</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-tighter">{review.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-secondary">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-[#FBBC05] text-[#FBBC05]" />
              ))}
            </div>
            <span className="font-bold text-dark">4.9/5 on Google Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
