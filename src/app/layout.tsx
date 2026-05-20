import React from "react";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getSystemSettings } from "@/lib/settings";
import "./globals.css";

// Stable Script Injector component to completely bypass React hydration & reconciliation crashes (removeChild issues)
function ScriptInjector({ content, target }: { content: string | null | undefined; target: "head" | "body" }) {
  if (!content) return null;

  const targetSelector = target === "head" ? "document.head" : "document.body";
  const jsCode = `
    (function() {
      var html = ${JSON.stringify(content)};
      if (!html) return;
      var container = document.createElement('div');
      container.innerHTML = html;
      var nodes = Array.prototype.slice.call(container.childNodes);
      var targetEl = ${targetSelector};
      if (!targetEl) return;
      nodes.forEach(function(node) {
        if (node.nodeName.toLowerCase() === 'script') {
          var script = document.createElement('script');
          Array.prototype.slice.call(node.attributes).forEach(function(attr) {
            script.setAttribute(attr.name, attr.value);
          });
          script.text = node.innerHTML;
          targetEl.appendChild(script);
        } else {
          targetEl.appendChild(node);
        }
      });
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: jsCode }} />;
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "The Care First Physiotherapy Service | Modern Physio & Aged Care Brisbane",
  description: "Professional physiotherapy and aged care services in Brisbane. Specialized in NDIS, elderly care, and rehabilitation with a client-centered approach.",
  keywords: ["Physiotherapy Brisbane", "Mobile Physiotherapy", "NDIS Physiotherapy Brisbane", "Aged Care Physiotherapy", "Strength and Balance Program"],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch system configurations
  const settings = await getSystemSettings();

  // Retrieve current request path from custom middleware header
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Identify public routes (we bypass maintenance controls for /admin portal and backend API operations)
  const isPublicRoute = 
    !pathname.startsWith("/admin") && 
    !pathname.startsWith("/api") && 
    !pathname.startsWith("/_next") &&
    pathname !== "/favicon.ico";

  // RENDER: Maintenance Mode Screen
  if (settings.maintenanceMode && isPublicRoute) {
    return (
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <head><title>Scheduled Maintenance | The Care First Physiotherapy</title><ScriptInjector content={settings.googleTagHeader} target="head" /></head>
        <body className="antialiased min-h-screen bg-gradient-to-tr from-secondary/20 via-white to-light flex items-center justify-center p-6 font-sans">
          <ScriptInjector content={settings.googleTagBody} target="body" />
          <div className="max-w-xl w-full text-center bg-white p-8 md:p-14 rounded-[40px] shadow-2xl border border-gray-100 relative overflow-hidden flex flex-col items-center">
            {/* Elegant Top Decorative Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary/80 to-primary" />

            {/* Glowing Gear/Clock Animation Container */}
            <div className="w-20 h-20 bg-secondary rounded-[24px] flex items-center justify-center text-primary mb-8 shadow-sm">
              <Clock size={36} className="animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark mb-4 leading-tight">
              Scheduled <span className="text-primary">Maintenance</span>
            </h1>

            {/* Configured Maintenance Message */}
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-10 max-w-md">
              {settings.maintenanceMessage || 
                "The Care First website is temporarily down for scheduled upgrades and maintenance. We will be back online shortly."}
            </p>

            {/* Contact details row to ensure high client trust */}
            <div className="w-full border-t border-gray-100 pt-8 space-y-4 text-left">
              <h2 className="text-xs uppercase font-bold tracking-widest text-gray-400 text-center mb-4">
                Need to reach us immediately?
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <a 
                  href={`tel:${settings.phone || ""}`}
                  className="flex items-center gap-3 p-4 bg-light hover:bg-secondary/20 rounded-2xl transition-colors group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-primary shrink-0 shadow-xs group-hover:bg-primary group-hover:text-white transition-colors">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                    <p className="text-xs font-bold text-dark truncate mt-0.5">{settings.phone || "+61 (000) 000 000"}</p>
                  </div>
                </a>

                <a 
                  href={`mailto:${settings.email || ""}`}
                  className="flex items-center gap-3 p-4 bg-light hover:bg-secondary/20 rounded-2xl transition-colors group cursor-pointer"
                >
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-primary shrink-0 shadow-xs group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-xs font-bold text-dark truncate mt-0.5">{settings.email || "info@carefirstphysio.com.au"}</p>
                  </div>
                </a>
              </div>

              {settings.address && (
                <div className="flex items-start gap-3 p-4 bg-light/50 rounded-2xl text-xs text-gray-500">
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{settings.address}</p>
                </div>
              )}
            </div>

            {/* Copyright stamp */}
            <p className="text-[10px] text-gray-400 mt-10">
              © {new Date().getFullYear()} The Care First Physiotherapy. All rights reserved.
            </p>
          </div>
          <ScriptInjector content={settings.googleTagFooter} target="body" />
        </body>
      </html>
    );
  }

  // RENDER: Default Web Layout
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head><ScriptInjector content={settings.googleTagHeader} target="head" /></head>
      <body className="antialiased">
        <ScriptInjector content={settings.googleTagBody} target="body" />
        {children}
        <ScriptInjector content={settings.googleTagFooter} target="body" />
      </body>
    </html>
  );
}
