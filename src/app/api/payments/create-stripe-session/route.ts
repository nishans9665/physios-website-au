import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { randomBytes } from "node:crypto";

function getAppUrl(req: Request): string {
  // 1. Read NEXT_PUBLIC_APP_URL environment variable (.env)
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }

  // 2. Read dynamically from request origin header
  const origin = req.headers.get("origin");
  if (origin && origin !== "null") {
    return origin.replace(/\/$/, "");
  }

  // 3. Read dynamically from request host header
  const host = req.headers.get("host") || req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  throw new Error("NEXT_PUBLIC_APP_URL environment variable is not defined in .env file");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { referralId, clientEmail, clientName } = body;

    if (!clientEmail) {
      return NextResponse.json({ error: "Client email is required for payment" }, { status: 400 });
    }

    // 1. Fetch System Settings to get authoritative payable consultation fee
    const settings = await prisma.systemSetting.findUnique({ where: { id: "settings" } });
    const amount = settings?.consultationFee || 150.0;
    const currency = "aud";

    // 2. Generate unique Payment Reference (e.g. PAY-A1B2C3D4)
    const refCode = randomBytes(4).toString("hex").toUpperCase();
    const paymentReference = `PAY-${refCode}`;

    const appUrl = getAppUrl(req);

    // 3. Upsert Payment Record in DB as PENDING
    let paymentRecord;
    if (referralId) {
      paymentRecord = await prisma.payment.upsert({
        where: { referralId },
        update: {
          paymentReference,
          amount,
          currency: currency.toUpperCase(),
          paymentMethod: "CARD",
          paymentGateway: "STRIPE",
          paymentStatus: "PENDING",
        },
        create: {
          referralId,
          paymentReference,
          amount,
          currency: currency.toUpperCase(),
          paymentMethod: "CARD",
          paymentGateway: "STRIPE",
          paymentStatus: "PENDING",
        },
      });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // 4. Handle Stripe Checkout Session creation
    if (stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2025-01-27.acacia" as any,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: clientEmail,
        client_reference_id: referralId || paymentReference,
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: "Physiotherapy Private Consultation",
                description: `Payment Ref: ${paymentReference} | The Care First Physiotherapy`,
              },
              unit_amount: Math.round(amount * 100), // convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          paymentReference,
          referralId: referralId || "",
          clientName: clientName || "",
          clientEmail: clientEmail || "",
        },
        success_url: `${appUrl}/referral/payment-success?session_id={CHECKOUT_SESSION_ID}&ref=${paymentReference}`,
        cancel_url: `${appUrl}/referral?canceled=true`,
      });

      // Update payment record with stripe checkout session id
      if (paymentRecord) {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { stripeCheckoutSessionId: session.id },
        });
      }

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        paymentReference,
        sessionId: session.id,
      });
    } else {
      // DRY RUN MODE: When STRIPE_SECRET_KEY is not configured yet in environment
      console.log("---------------- DRY RUN STRIPE MODE ----------------");
      console.log(`Simulating Stripe Checkout for ${clientEmail}, Amount: $${amount} AUD, Ref: ${paymentReference}`);
      console.log("-----------------------------------------------------");

      const mockSuccessUrl = `${appUrl}/referral/payment-success?session_id=mock_session_${paymentReference}&ref=${paymentReference}`;

      return NextResponse.json({
        success: true,
        checkoutUrl: mockSuccessUrl,
        paymentReference,
        mockMode: true,
      });
    }
  } catch (error: any) {
    console.error("Error creating Stripe session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize Stripe payment session" },
      { status: 500 }
    );
  }
}
