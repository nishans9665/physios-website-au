import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedServices from "@/components/home/FeaturedServices";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import AboutSection from "@/components/home/AboutSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import FAQSection from "@/components/home/FAQSection";
import Testimonials from "@/components/home/Testimonials";
import { MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Home Page Sections */}
      <Hero />
      <FeaturedServices />
      <AboutSection />
      <WhyChooseUs />
      <StatisticsSection />
      <Testimonials />
      <FAQSection />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/61000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 animate-bounce"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle size={32} />
      </a>

      <Footer />
    </main>
  );
}
