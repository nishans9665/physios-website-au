import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "node:crypto";
import { sendBankTransferSubmittedEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referralId, clientEmail, clientName, paymentSlip } = body;

    if (!clientEmail) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 });
    }

    if (!paymentSlip) {
      return NextResponse.json({ error: "Payment slip upload is required" }, { status: 400 });
    }

    // 1. Fetch System Settings to get payable consultation fee
    const settings = await prisma.systemSetting.findUnique({ where: { id: "settings" } });
    const amount = settings?.consultationFee || 150.0;

    // 2. Generate unique Payment Reference (e.g. PAY-B8C9D0E1)
    const refCode = randomBytes(4).toString("hex").toUpperCase();
    const paymentReference = `PAY-${refCode}`;

    // 3. Upsert Payment Record in DB as PENDING_VERIFICATION
    let paymentRecord;
    if (referralId) {
      paymentRecord = await prisma.payment.upsert({
        where: { referralId },
        update: {
          paymentReference,
          amount,
          currency: "AUD",
          paymentMethod: "BANK_TRANSFER",
          paymentGateway: "BANK_TRANSFER",
          paymentStatus: "PENDING_VERIFICATION",
          bankTransferReference: paymentReference,
          paymentSlip,
        },
        create: {
          referralId,
          paymentReference,
          amount,
          currency: "AUD",
          paymentMethod: "BANK_TRANSFER",
          paymentGateway: "BANK_TRANSFER",
          paymentStatus: "PENDING_VERIFICATION",
          bankTransferReference: paymentReference,
          paymentSlip,
        },
      });
    } else {
      return NextResponse.json({ error: "Referral ID is required for bank transfer" }, { status: 400 });
    }

    // 4. Update Referral status to PENDING_REVIEW
    await prisma.referral.update({
      where: { id: referralId },
      data: { status: "PENDING_REVIEW" },
    }).catch((err) => console.error("Failed to update referral status for bank transfer:", err));

    // 5. Send automated confirmation email to customer
    await sendBankTransferSubmittedEmail({
      customerName: clientName || "Valued Client",
      customerEmail: clientEmail,
      paymentReference,
      amount,
    });

    return NextResponse.json({
      success: true,
      paymentReference,
      status: "PENDING_VERIFICATION",
      amount,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting bank transfer payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit bank transfer details" },
      { status: 500 }
    );
  }
}
