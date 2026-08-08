import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendPaymentReceiptEmail, sendBankTransferRejectedEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.paymentStatus = status;
    }

    if (method && method !== "ALL") {
      whereClause.paymentMethod = method;
    }

    if (search) {
      whereClause.OR = [
        { paymentReference: { contains: search } },
        { stripeCheckoutSessionId: { contains: search } },
        { stripePaymentIntentId: { contains: search } },
        { bankTransferReference: { contains: search } },
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
    } else if (action === "SYNC_STRIPE") {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        return NextResponse.json({ error: "Stripe API Key is not configured." }, { status: 400 });
      }

      if (!existingPayment.stripeCheckoutSessionId && !existingPayment.stripePaymentIntentId) {
        return NextResponse.json({ error: "No Stripe Checkout Session or Intent ID associated with this payment." }, { status: 400 });
      }

      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-01-27.acacia" as any,
      });

      let sessionPaid = false;
      let paymentIntentId = existingPayment.stripePaymentIntentId;

      if (existingPayment.stripeCheckoutSessionId) {
        const session = await stripe.checkout.sessions.retrieve(existingPayment.stripeCheckoutSessionId);
        if (session.payment_status === "paid") {
          sessionPaid = true;
          paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : paymentIntentId;
        }
      } else if (existingPayment.stripePaymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentIntentId);
        if (pi.status === "succeeded") {
          sessionPaid = true;
        }
      }

      if (sessionPaid) {
        const updatedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentStatus: "PAID",
            stripePaymentIntentId: paymentIntentId,
            paidAt: existingPayment.paidAt || new Date(),
          },
        });

        if (existingPayment.referralId) {
          await prisma.referral.update({
            where: { id: existingPayment.referralId },
            data: { status: "APPROVED" },
          }).catch((e) => console.error("Failed to update referral on Stripe sync:", e));
        }

        if (clientEmail && existingPayment.paymentStatus !== "PAID") {
          await sendPaymentReceiptEmail({
            customerName: clientName,
            customerEmail: clientEmail,
            paymentReference: existingPayment.paymentReference,
            amount: existingPayment.amount,
            paymentMethod: "CARD",
            paymentDate: new Date().toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            bookingReference: existingPayment.referralId,
          }).catch((e) => console.error("Failed sending email on stripe sync:", e));
        }

        return NextResponse.json({
          success: true,
          message: "Stripe payment status verified as PAID.",
          payment: updatedPayment,
        });
      } else {
        return NextResponse.json({
          success: true,
          message: "Stripe payment is still pending or unpaid.",
          payment: existingPayment,
        });
      }
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Error managing payment in admin API:", error);
    return NextResponse.json({ error: error.message || "Failed to update payment status" }, { status: 500 });
  }
}
