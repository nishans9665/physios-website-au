import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceiptEmail, sendBankTransferRejectedEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.paymentStatus = status;
    }

    if (search) {
      whereClause.OR = [
        { paymentReference: { contains: search } },
        { referral: { client: { fullName: { contains: search } } } },
        { referral: { client: { email: { contains: search } } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        referral: {
          include: {
            client: true,
            contact: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    console.error("Error fetching admin payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, action, rejectionReason, adminNotes } = body;

    if (!paymentId || !action) {
      return NextResponse.json({ error: "Payment ID and action are required" }, { status: 400 });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { referral: { include: { client: true } } },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const clientName = existingPayment.referral?.client?.fullName || "Valued Client";
    const clientEmail = existingPayment.referral?.client?.email || "";

    if (action === "APPROVE") {
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          adminNotes: adminNotes || undefined,
        },
      });

      // Update related referral status to APPROVED
      if (existingPayment.referralId) {
        await prisma.referral.update({
          where: { id: existingPayment.referralId },
          data: { status: "APPROVED" },
        }).catch((e) => console.error("Failed to update referral on payment approval:", e));
      }

      // Send payment receipt email
      if (clientEmail) {
        await sendPaymentReceiptEmail({
          customerName: clientName,
          customerEmail: clientEmail,
          paymentReference: existingPayment.paymentReference,
          amount: existingPayment.amount,
          paymentMethod: existingPayment.paymentMethod,
          paymentDate: new Date().toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          bookingReference: existingPayment.referralId,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Payment approved successfully and receipt sent.",
        payment: updatedPayment,
      });
    } else if (action === "REJECT") {
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: "REJECTED",
          rejectionReason: rejectionReason || "Unable to verify bank transfer receipt",
          adminNotes: adminNotes || undefined,
        },
      });

      // Send rejection notification email
      if (clientEmail) {
        await sendBankTransferRejectedEmail({
          customerName: clientName,
          customerEmail: clientEmail,
          paymentReference: existingPayment.paymentReference,
          rejectionReason: rejectionReason || "Unable to verify bank transfer receipt against company records.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "Payment rejected and customer notified.",
        payment: updatedPayment,
      });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error managing payment in admin API:", error);
    return NextResponse.json({ error: error.message || "Failed to update payment status" }, { status: 500 });
  }
}
