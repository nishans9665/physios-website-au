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
  } catch (error) {
    return null;
  }
}

// UPDATE a lead's status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    const { id } = await params;

    const updatedLead = await prisma.contactLead.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

// DELETE a lead
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Restrict Staff Managers from deleting data
  if (user.role === "STAFF_MANAGER") {
    return NextResponse.json(
      { error: "Staff Managers do not have permission to delete administrative records." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    await prisma.contactLead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
