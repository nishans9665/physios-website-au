import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactLeadEmail } from "@/lib/nodemailer";

// GET all leads
export async function GET() {
  try {
    const leads = await prisma.contactLead.findMany({
      orderBy: { submissionDate: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

// POST new lead (Public endpoint for the website contact form)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate
    if (!data.fullName || !data.email || !data.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newLead = await prisma.contactLead.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        message: data.message,
        serviceInterest: data.serviceInterest || null,
        status: "NEW",
      },
    });

    // Send email notification to admin asynchronously
    sendContactLeadEmail({
      fullName: newLead.fullName,
      email: newLead.email,
      phoneNumber: newLead.phoneNumber,
      message: newLead.message,
      serviceInterest: newLead.serviceInterest,
    }).catch((err) => {
      console.error("Failed to send contact lead email:", err);
    });

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}
