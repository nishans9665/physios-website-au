import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { sendReferralEmails } from "@/lib/nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

// GET all referrals (Protected endpoint for admin dashboard)
export async function GET(req: Request) {
  const authenticated = await verifyAuth();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        {
          client: {
            fullName: { contains: search }
          }
        },
        {
          client: {
            email: { contains: search }
          }
        },
        {
          referrer: {
            referrerName: { contains: search }
          }
        }
      ];
    }

    const referrals = await prisma.referral.findMany({
      where: whereClause,
      include: {
        client: true,
        referrer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("GET referrals error:", error);
    return NextResponse.json({ error: "Failed to retrieve referrals" }, { status: 500 });
  }
}

// POST submit a referral (Public intake endpoint)
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 1. Validation
    if (!data.client?.fullName || !data.client?.email || !data.client?.phoneNumber) {
      return NextResponse.json({ error: "Missing required client details" }, { status: 400 });
    }

    if (!data.paymentType) {
      return NextResponse.json({ error: "Missing payment type" }, { status: 400 });
    }

    // 2. Perform Transaction to save all models in atomic sync
    const result = await prisma.$transaction(async (tx) => {
      // Create primary referral
      const referral = await tx.referral.create({
        data: {
          paymentType: data.paymentType,
          providerName: data.providerName || null,
          invoiceContactName: data.invoiceContactName || null,
          coordinatorName: data.coordinatorName || null,
          invoiceEmail: data.invoiceEmail || null,
          preferredAppointmentType: data.preferredAppointmentType || "No Preference",
          unavailability: data.unavailability || null,
          preferredDays: Array.isArray(data.preferredDays) ? data.preferredDays.join(", ") : (data.preferredDays || null),
          preferredTime: data.preferredTime || null,
          privacyConsent: !!data.privacyConsent,
          contactConsent: !!data.contactConsent,
          medicalConsent: !!data.medicalConsent,
          status: "NEW",
        },
      });

      // Create Client details
      await tx.referralClient.create({
        data: {
          referralId: referral.id,
          fullName: data.client.fullName,
          email: data.client.email,
          address: data.client.address || "",
          phoneNumber: data.client.phoneNumber,
          dob: new Date(data.client.dob),
          gender: data.client.gender || "Prefer not to answer",
          reasonForReferral: data.client.reasonForReferral || null,
        },
      });

      // Create Next of Kin contact details
      await tx.referralContact.create({
        data: {
          referralId: referral.id,
          contactName: data.contact?.contactName || "Not Provided",
          email: data.contact?.email || "",
          address: data.contact?.address || "",
          phoneNumber: data.contact?.phoneNumber || "",
        },
      });

      // Create Referrer details
      await tx.referrerDetails.create({
        data: {
          referralId: referral.id,
          referrerName: data.referrer?.referrerName || "Self Referral",
          companyName: data.referrer?.companyName || null,
          email: data.referrer?.email || "",
          address: data.referrer?.address || "",
          phoneNumber: data.referrer?.phoneNumber || "",
        },
      });

      // Create Medical History
      await tx.referralMedicalHistory.create({
        data: {
          referralId: referral.id,
          primaryDiagnosis: data.medicalHistory?.primaryDiagnosis || "Not Stated",
          recentFallsSurgeryRisks: data.medicalHistory?.recentFallsSurgeryRisks || null,
          cognitiveDiagnosis: data.medicalHistory?.cognitiveDiagnosis || null,
          specificPrecautions: data.medicalHistory?.specificPrecautions || null,
          otherMedicalInfo: data.medicalHistory?.otherMedicalInfo || null,
        },
      });

      // Create NDIS details if payment is NDIS
      if (data.paymentType === "NDIS" && data.ndisDetails) {
        await tx.ndisParticipantDetails.create({
          data: {
            referralId: referral.id,
            managementType: data.ndisDetails.managementType || "Self Managed",
            planStartDate: data.ndisDetails.planStartDate ? new Date(data.ndisDetails.planStartDate) : null,
            participantId: data.ndisDetails.participantId || null,
            planEndDate: data.ndisDetails.planEndDate ? new Date(data.ndisDetails.planEndDate) : null,
            planManagerName: data.ndisDetails.planManagerName || null,
            planManagerContact: data.ndisDetails.planManagerContact || null,
            fundingArea: data.ndisDetails.fundingArea || null,
          },
        });
      }

      // Create Goals details
      await tx.referralGoals.create({
        data: {
          referralId: referral.id,
          clientGoals: data.goals?.clientGoals || "Improve quality of life",
          additionalInfo: data.goals?.additionalInfo || null,
        },
      });

      // Create Support Workers
      if (Array.isArray(data.supportWorkers) && data.supportWorkers.length > 0) {
        await tx.referralSupportWorker.createMany({
          data: data.supportWorkers.map((sw: any) => ({
            referralId: referral.id,
            name: sw.name,
            phoneNumber: sw.phoneNumber,
          })),
        });
      }

      // Create Uploaded Documents
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        await tx.uploadedDocument.createMany({
          data: data.documents.map((doc: any) => ({
            referralId: referral.id,
            fileName: doc.fileName,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            fileUrl: doc.fileUrl,
            documentType: doc.documentType || "referral",
          })),
        });
      }

      // Create Admin Notification
      await tx.notification.create({
        data: {
          title: "New Physiotherapy Referral",
          message: `Referral submitted for client ${data.client.fullName} (${data.paymentType})`,
          type: "SYSTEM",
          read: false,
        },
      });

      return referral;
    });

    // 3. Send nodemailer details in a secure, non-blocking background thread
    sendReferralEmails({
      referralId: result.id,
      data: data,
    }).catch(err => console.error("Nodemailer dispatch error:", err));

    return NextResponse.json({ success: true, referralId: result.id }, { status: 201 });
  } catch (error) {
    console.error("Referral submission route error:", error);
    return NextResponse.json({ error: "Failed to submit referral to data store" }, { status: 500 });
  }
}
