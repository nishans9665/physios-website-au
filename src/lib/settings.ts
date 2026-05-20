import { prisma } from "@/lib/prisma";

export async function getSystemSettings() {
  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "settings" },
    });
    if (settings) return settings;
  } catch (error) {
    console.error("Error reading system settings from database:", error);
  }

  // Safe fallback defaults to avoid crashes and keep the website live
  return {
    id: "settings",
    maintenanceMode: false,
    maintenanceMessage: "The Care First website is temporarily down for scheduled upgrades and maintenance. We will be back online shortly. Thank you for your patience!",
    googleTagHeader: "",
    googleTagBody: "",
    googleTagFooter: "",
    phone: "+61 (000) 000 000",
    email: "info@carefirstphysio.com.au",
    address: "Serving Brisbane & surrounding areas, Queensland, Australia",
    clinicHours: "Mon - Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 1:00 PM\nSun: Closed",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    linkedinUrl: "https://linkedin.com",
    youtubeUrl: "https://youtube.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
