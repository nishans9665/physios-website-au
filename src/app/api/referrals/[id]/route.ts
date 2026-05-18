import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

// GET a single referral with all details (Protected)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await verifyAuth();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        client: true,
        contact: true,
        referrer: true,
        medicalHistory: true,
        ndisDetails: true,
        supportWorkers: true,
        goals: true,
        documents: true,
        adminNotes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral record not found" }, { status: 404 });
    }

    return NextResponse.json(referral);
  } catch (error) {
    console.error("GET referral details error:", error);
    return NextResponse.json({ error: "Failed to retrieve referral details from store" }, { status: 500 });
  }
}

// PUT update status or add internal admin note (Protected)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await verifyAuth();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
    }

    // Perform update
    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: updateData,
    });

    // If an admin note was appended
    if (data.noteText) {
      await prisma.adminNotes.create({
        data: {
          referralId: id,
          authorName: data.authorName || "Administrator",
          noteText: data.noteText,
        },
      });
    }

    return NextResponse.json(updatedReferral);
  } catch (error) {
    console.error("PUT referral update error:", error);
    return NextResponse.json({ error: "Failed to update referral details in store" }, { status: 500 });
  }
}

// DELETE a referral (Protected)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await verifyAuth();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.referral.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE referral error:", error);
    return NextResponse.json({ error: "Failed to delete referral record from store" }, { status: 500 });
  }
}
