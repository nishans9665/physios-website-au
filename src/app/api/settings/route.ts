import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getSystemSettings } from "@/lib/settings";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// GET active settings (Public-accessible)
export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET settings API error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

// PUT/POST save or update system settings (Admin-only)
export async function PUT(req: Request) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      maintenanceMode,
      maintenanceMessage,
      googleTagHeader,
      googleTagBody,
      googleTagFooter,
      phone,
      email,
      address,
      clinicHours,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      youtubeUrl,
    } = body;

    // Upsert a single config record with fixed ID "settings"
    const updatedSettings = await prisma.systemSetting.upsert({
      where: { id: "settings" },
      update: {
        maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : undefined,
        maintenanceMessage: maintenanceMessage !== undefined ? maintenanceMessage : undefined,
        googleTagHeader: googleTagHeader !== undefined ? googleTagHeader : undefined,
        googleTagBody: googleTagBody !== undefined ? googleTagBody : undefined,
        googleTagFooter: googleTagFooter !== undefined ? googleTagFooter : undefined,
        phone: phone !== undefined ? phone : undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        clinicHours: clinicHours !== undefined ? clinicHours : undefined,
        facebookUrl: facebookUrl !== undefined ? facebookUrl : undefined,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : undefined,
        youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : undefined,
      },
      create: {
        id: "settings",
        maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : false,
        maintenanceMessage: maintenanceMessage || "",
        googleTagHeader: googleTagHeader || "",
        googleTagBody: googleTagBody || "",
        googleTagFooter: googleTagFooter || "",
        phone: phone || "",
        email: email || "",
        address: address || "",
        clinicHours: clinicHours || "",
        facebookUrl: facebookUrl || "",
        instagramUrl: instagramUrl || "",
        linkedinUrl: linkedinUrl || "",
        youtubeUrl: youtubeUrl || "",
      },
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("PUT settings API error:", error);
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}

// Support POST as an alias to PUT for additional coverage
export async function POST(req: Request) {
  return PUT(req);
}
