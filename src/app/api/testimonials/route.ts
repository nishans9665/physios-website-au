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
  } catch (error) {
    return null;
  }
}

// GET testimonials
// GET /api/testimonials -> Returns only ACTIVE testimonials for public display
// GET /api/testimonials?admin=true -> Returns all testimonials for the admin portal
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdminView = searchParams.get("admin") === "true";

    if (isAdminView) {
      const user = await verifyAuth();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
      
      const testimonials = await prisma.testimonial.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(testimonials);
    }

    // Public view: only ACTIVE testimonials
    const testimonials = await prisma.testimonial.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("GET testimonials error:", error);
    return NextResponse.json({ error: "Failed to retrieve testimonials" }, { status: 500 });
  }
}

// POST a new testimonial (Admin only)
export async function POST(req: Request) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { clientName, review, rating, profileImage, location, service, status } = body;

    if (!clientName || !review) {
      return NextResponse.json({ error: "Missing required fields: clientName and review are required" }, { status: 400 });
    }

    const parsedRating = rating !== undefined ? parseInt(String(rating), 10) : 5;

    const newTestimonial = await prisma.testimonial.create({
      data: {
        clientName,
        review,
        rating: isNaN(parsedRating) ? 5 : parsedRating,
        profileImage: profileImage || null,
        location: location || null,
        service: service || null,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, testimonial: newTestimonial }, { status: 201 });
  } catch (error) {
    console.error("POST testimonial error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
