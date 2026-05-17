import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UPDATE a lead's status
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();

    const updatedLead = await prisma.contactLead.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

// DELETE a lead
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.contactLead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
