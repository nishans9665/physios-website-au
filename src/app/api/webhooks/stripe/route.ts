import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendPaymentReceiptEmail } from "@/lib/nodemailer";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.warn("Stripe secret key or webhook secret is missing in environment variables.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-01-27.acacia" as any,
  });

  let event: Stripe.Event;

  try {
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature header" }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Verification Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Authoritatively process successful checkout events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const paymentRef = session.metadata?.paymentReference;
    const referralId = session.metadata?.referralId || session.client_reference_id;
    const clientEmail = session.customer_email || session.metadata?.clientEmail || "";
    const clientName = session.metadata?.clientName || "Valued Client";
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 150.0;

    try {
      // Find existing payment or create
      let paymentRecord = null;

      if (paymentRef) {
        paymentRecord = await prisma.payment.findUnique({ where: { paymentReference: paymentRef } });
      }

      if (!paymentRecord && referralId) {
        paymentRecord = await prisma.payment.findUnique({ where: { referralId } });
      }

      if (paymentRecord) {
        // Prevent duplicate processing
        if (paymentRecord.paymentStatus === "PAID") {
          return NextResponse.json({ received: true, message: "Payment already processed" });
        }

        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            paymentStatus: "PAID",
            paymentMethod: "CARD",
            paymentGateway: "STRIPE",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            paidAt: new Date(),
          },
        });
      } else if (referralId) {
        paymentRecord = await prisma.payment.create({
          data: {
            referralId,
            paymentReference: paymentRef || `PAY-${session.id.slice(-8).toUpperCase()}`,
            amount: amountPaid,
            currency: "AUD",
            paymentMethod: "CARD",
            paymentGateway: "STRIPE",
            paymentStatus: "PAID",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            paidAt: new Date(),
          },
        });
      }

      // Update associated Referral status to APPROVED / IN_PROGRESS
      if (referralId) {
        await prisma.referral.update({
          where: { id: referralId },
          data: { status: "APPROVED" },
        }).catch((e) => console.error("Failed updating referral status after payment:", e));
      }

      // Automatically send payment receipt email
      if (clientEmail && paymentRecord) {
        await sendPaymentReceiptEmail({
          customerName: clientName,
          customerEmail: clientEmail,
          paymentReference: paymentRecord.paymentReference,
          amount: amountPaid,
          paymentMethod: "CARD",
          paymentDate: new Date().toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          bookingReference: referralId || undefined,
        });
      }
    } catch (dbErr) {
      console.error("Database error processing Stripe webhook:", dbErr);
      return NextResponse.json({ error: "Failed to update payment record" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
