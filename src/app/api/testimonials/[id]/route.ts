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

// DELETE a testimonial by ID (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing testimonial ID" }, { status: 400 });
    }

    // Check if the testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Delete it
    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Testimonial successfully deleted" });
  } catch (error) {
    console.error("DELETE testimonial error:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}

// PUT update a testimonial by ID (Admin only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing testimonial ID" }, { status: 400 });
    }

    const body = await req.json();
    const { clientName, review, rating, profileImage, location, service, status } = body;

    // Check if the testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const parsedRating = rating !== undefined ? parseInt(String(rating), 10) : undefined;

    // Update it
    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(clientName && { clientName }),
        ...(review && { review }),
        ...(parsedRating !== undefined && !isNaN(parsedRating) && { rating: parsedRating }),
        profileImage: profileImage !== undefined ? profileImage : existingTestimonial.profileImage,
        location: location !== undefined ? location : existingTestimonial.location,
        service: service !== undefined ? service : existingTestimonial.service,
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    console.error("PUT testimonial error:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}
