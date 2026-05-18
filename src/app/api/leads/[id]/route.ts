import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UPDATE a lead's status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
