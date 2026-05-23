"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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
];

const Testimonials = () => {
  const [reviews, setReviews] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map DB schema properties to UI reviews properties
            const mappedReviews = data.slice(0, 3).map((item: any) => ({
              name: item.clientName,
              rating: item.rating,
              comment: item.review,
              service: item.service || "Verified Client",
              date: item.location || "Brisbane",
              profileImage: item.profileImage,
            }));
            setReviews(mappedReviews);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to load active testimonials from server:", error);
      }
      setReviews(fallbackReviews);
    };

    loadTestimonials();
  }, []);

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
              className="bg-secondary/20 p-8 rounded-[40px] relative hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-8 right-8 text-primary/20">
                  <Quote size={48} fill="currentColor" />
                </div>

                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-gray-600 mb-8 italic leading-relaxed text-sm">
                  "{review.comment}"
                </p>
              </div>

              <div className="flex items-center gap-4 border-t border-secondary/10 pt-4 mt-4">
                {review.profileImage ? (
                  <img
                    src={review.profileImage}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border border-secondary"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {review.name[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-dark truncate text-sm">{review.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-gray-400 mt-0.5">
                    <span className="truncate">{review.date}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-primary font-semibold truncate">{review.service}</span>
                  </div>
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
