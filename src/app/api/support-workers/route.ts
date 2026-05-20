import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// GET all active support workers
// Public access so the referral form (Step 8) can fetch them
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    // Admin requests with ?all=true see inactive workers too
    if (includeInactive) {
      const user = await verifyAuth();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const all = await prisma.globalSupportWorker.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(all);
    }

    // Public: only active workers for the referral form
    const workers = await prisma.globalSupportWorker.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phoneNumber: true, role: true, organisation: true },
    });
    return NextResponse.json(workers);
  } catch (error) {
    console.error("GET support-workers error:", error);
    return NextResponse.json({ error: "Failed to fetch support workers" }, { status: 500 });
  }
}

// POST create a new global support worker (Admin only)
export async function POST(req: Request) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, phoneNumber, email, role, organisation, notes } = body;

    if (!name?.trim() || !phoneNumber?.trim()) {
      return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
    }

    const worker = await prisma.globalSupportWorker.create({
      data: {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email?.trim() || null,
        role: role?.trim() || null,
        organisation: organisation?.trim() || null,
        notes: notes?.trim() || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, worker }, { status: 201 });
  } catch (error) {
    console.error("POST support-workers error:", error);
    return NextResponse.json({ error: "Failed to create support worker" }, { status: 500 });
  }
}
