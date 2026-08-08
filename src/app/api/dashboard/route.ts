import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";

async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Run all counts in parallel for speed
    const [
      totalLeads,
      leadsLastMonth,
      totalReferrals,
      referralsLastMonth,
      totalPaymentsAgg,
      todayPaymentsAgg,
      recentLeads,
    ] = await Promise.all([
      // Total leads (all time)
      prisma.contactLead.count(),
      // Leads last month (for trend)
      prisma.contactLead.count({
        where: { submissionDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      // Total referrals/appointments
      prisma.referral.count(),
      // Referrals last month
      prisma.referral.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      // Total Revenue (PAID payments)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: "PAID" },
      }),
      // Today's Payments (PAID payments today)
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: startOfToday },
        },
      }),
      // 5 most recent leads for the table
      prisma.contactLead.findMany({
        orderBy: { submissionDate: "desc" },
        take: 5,
        select: {
          id: true,
          fullName: true,
          serviceInterest: true,
          status: true,
          submissionDate: true,
          email: true,
          phoneNumber: true,
        },
      }),
    ]);

    // Calculate percentage trends
    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const pct = Math.round(((current - previous) / previous) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    };

    const leadsThisMonth = await prisma.contactLead.count({
      where: { submissionDate: { gte: startOfThisMonth } },
    });
    const referralsThisMonth = await prisma.referral.count({
      where: { createdAt: { gte: startOfThisMonth } },
    });

    const totalPayments = totalPaymentsAgg._sum.amount ?? 0;
    const todayPayments = todayPaymentsAgg._sum.amount ?? 0;

    return NextResponse.json({
      stats: {
        totalLeads,
        leadsTrend: calcTrend(leadsThisMonth, leadsLastMonth),
        totalReferrals,
        referralsTrend: calcTrend(referralsThisMonth, referralsLastMonth),
        totalPayments,
        todayPayments,
      },
      recentLeads,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
