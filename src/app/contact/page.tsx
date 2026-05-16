"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-light">
      <Navbar />
      
      {/* Header */}
      <section className="pt-40 pb-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold text-dark mb-6"
          >
            Get In <span className="text-primary">Touch</span>
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're here to help you on your journey to recovery. Reach out to book an appointment or ask any questions.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-dark mb-10">Contact Information</h2>
            
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">Call Us</h3>
                <p className="text-gray-500 text-sm">+61 (000) 000 000</p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">Email Us</h3>
                <p className="text-gray-500 text-sm">info@carefirstphysio.com.au</p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">WhatsApp</h3>
                <p className="text-gray-500 text-sm">+61 000 000 000</p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="font-bold text-dark mb-2">Operating Hours</h3>
                <p className="text-gray-500 text-xs uppercase font-bold text-primary">Mon - Fri: 8am - 6pm</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm flex items-start gap-6">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-dark mb-2">Service Areas</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We provide mobile physiotherapy across Brisbane, Queensland, and surrounding suburbs.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-10 md:p-12 rounded-[60px] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            <h2 className="text-3xl font-serif font-bold text-dark mb-8">Send Us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+61 000 000 000" 
                    className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Service Required</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer">
                  <option>NDIS Physiotherapy</option>
                  <option>Aged Care Physiotherapy</option>
                  <option>Strength & Balance Program</option>
                  <option>General Physiotherapy</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Message</label>
                <textarea 
                  rows={4} 
                  placeholder="How can we help you?" 
                  className="w-full px-6 py-4 rounded-2xl bg-light border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-3">
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
