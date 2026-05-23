"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const fallbackReviews = [
  {
    name: "Sophie Goddard",
    location: "Brisbane North",
    rating: 5,
    comment: "Mali is a great Physiotherapist. She listens to concerns and then creates individualised exercise plans. Very reassuring, compassionate, professional and reliable. Would highly recommend!",
    service: "Aged Care Physio",
    profileImage: null,
  },
  {
    name: "Ehleeza",
    location: "South Brisbane",
    rating: 5,
    comment: "Mali demonstrates outstanding clinical skills, professionalism, and genuine compassion in her physiotherapy practice. She engages patients with empathy, provides individualized treatment plans, and ensures a supportive and positive rehabilitation experience. Highly recommended.",
    service: "NDIS Physiotherapy",
    profileImage: null,
  },
  {
    name: "Isabell Leftwich",
    location: "Indooroopilly",
    rating: 5,
    comment: "Prompt efficient service that’s pleasant & quick results Mali came to my home & gave me treatment & a copy of exercises to do every day very grateful for good results.",
    service: "Strength & Balance",
    profileImage: null,
  },
  {
    name: "Cha Gose",
    location: "Chermside",
    rating: 5,
    comment: "Excellent service and very responsive to queries. Thanks! ",
    service: "Mobile Physio",
    profileImage: null,
  },
  {
    name: "Parvinder Multani",
    location: "Mount Gravatt",
    rating: 5,
    comment: "I highly recommend Mali, an amazing physiotherapist! She provides excellent service and truly cares about her clients. Mali is very friendly, professional, and makes you feel comfortable during every session. Her dedication and knowledge really show in the quality of care she provides. If you're looking for a skilled and compassionate physiotherapist, Mali is definitely the one to see!",
    service: "Telehealth",
    profileImage: null,
  },
  {
    name: "Cheryl	Rebeiro",
    location: "Ascot",
    rating: 5,
    comment: "I have had the privilege and honour of working alongside Mali. If I were a patient, The Care First Physiotherapy Service would be my choice for the best care. It is where one can be confident of person centered care and where one is completely involved in the decision making.",
    service: "Aged Care Physio",
    profileImage: null,
  }, 
];

export default function TestimonialsPage() {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped = data.map((item: any) => ({
              name: item.clientName,
              location: item.location || "Brisbane",
              rating: item.rating,
              comment: item.review,
              service: item.service || "Verified Client",
              profileImage: item.profileImage,
            }));
            setReviews(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load testimonials", err);
      }
      setReviews(fallbackReviews);
      setLoading(false);
    };

    fetchReviews();
  }, []);

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
          {loading ? (
            <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold">Loading patient stories...</p>
            </div>
          ) : (
            reviews.map((review, index) => (
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
                <div className="flex items-center gap-3">
                  {review.profileImage ? (
                    <img 
                      src={review.profileImage} 
                      alt={review.name} 
                      className="w-10 h-10 rounded-full object-cover border border-secondary"
                    />
                  ) : null}
                  <div>
                    <h4 className="font-bold text-dark">{review.name}</h4>
                    <p className="text-xs text-gray-400 font-semibold">{review.location}</p>
                  </div>
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
          ))
        )}
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
