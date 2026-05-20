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

// PATCH — update a support worker (toggle active / edit details)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, phoneNumber, email, role, organisation, notes, isActive } = body;

    const worker = await prisma.globalSupportWorker.update({
      where: { id },
      data: {
        ...(name !== undefined       && { name: name.trim() }),
        ...(phoneNumber !== undefined && { phoneNumber: phoneNumber.trim() }),
        ...(email !== undefined       && { email: email?.trim() || null }),
        ...(role !== undefined        && { role: role?.trim() || null }),
        ...(organisation !== undefined && { organisation: organisation?.trim() || null }),
        ...(notes !== undefined       && { notes: notes?.trim() || null }),
        ...(isActive !== undefined    && { isActive }),
      },
    });

    return NextResponse.json({ success: true, worker });
  } catch (error) {
    console.error("PATCH support-workers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update support worker" }, { status: 500 });
  }
}

// DELETE — permanently remove a support worker
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await verifyAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.globalSupportWorker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE support-workers/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete support worker" }, { status: 500 });
  }
}
