import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendPaymentReceiptEmail } from "@/lib/nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const ref = searchParams.get("ref");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    // Find payment record by session ID or payment ref
    let paymentRecord = await prisma.payment.findFirst({
      where: {
        OR: [
          { stripeCheckoutSessionId: sessionId },
          ...(ref ? [{ paymentReference: ref }] : []),
        ],
      },
      include: {
        referral: {
          include: {
            client: true,
          },
        },
      },
    });

    if (stripeSecretKey && !sessionId.startsWith("mock_session_")) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-01-27.acacia" as any,
      });

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
        const clientEmail = session.customer_email || session.metadata?.clientEmail || paymentRecord?.referral?.client?.email || "";
        const clientName = session.metadata?.clientName || paymentRecord?.referral?.client?.fullName || "Valued Client";

        if (paymentRecord) {
          if (paymentRecord.paymentStatus !== "PAID") {
            paymentRecord = await prisma.payment.update({
              where: { id: paymentRecord.id },
              data: {
                paymentStatus: "PAID",
                paymentMethod: "CARD",
                paymentGateway: "STRIPE",
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: paymentIntentId,
                paidAt: new Date(),
              },
              include: {
                referral: {
                  include: {
                    client: true,
                  },
                },
              },
            });

            if (paymentRecord.referralId) {
              await prisma.referral.update({
                where: { id: paymentRecord.referralId },
                data: { status: "APPROVED" },
              }).catch((e) => console.error("Failed to update referral status on verify:", e));
            }

            if (clientEmail) {
              await sendPaymentReceiptEmail({
                customerName: clientName,
                customerEmail: clientEmail,
                paymentReference: paymentRecord.paymentReference,
                amount: paymentRecord.amount,
                paymentMethod: "CARD",
                paymentDate: new Date().toLocaleDateString("en-AU", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                bookingReference: paymentRecord.referralId || undefined,
              }).catch((e) => console.error("Failed sending email receipt on verify:", e));
            }
          }
        }
      }
    }

    if (!paymentRecord) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: paymentRecord,
    });
  } catch (error: any) {
    console.error("Error verifying Stripe session:", error);
    return NextResponse.json({ error: error.message || "Failed to verify session" }, { status: 500 });
  }
}
