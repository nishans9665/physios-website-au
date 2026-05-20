import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

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

// PUT edit user details / change password
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await verifyAuth();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const { name, email, role, password } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required fields" }, { status: 400 });
    }

    // Verify user exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: "User not found" }, { status: 444 });
    }

    // Verify email uniqueness if email is changed
    if (email !== existingAdmin.email) {
      const emailConflict = await prisma.admin.findUnique({
        where: { email },
      });
      if (emailConflict) {
        return NextResponse.json({ error: "An admin user with this email address already exists" }, { status: 400 });
      }
    }

    const updateData: any = {
      name,
      email,
      role: role || existingAdmin.role,
    };

    // If password change is requested
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedAdmin });
  } catch (error) {
    console.error("PUT edit admin user error:", error);
    return NextResponse.json({ error: "Failed to update admin user details" }, { status: 500 });
  }
}

// DELETE an admin user
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const currentUser = await verifyAuth();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  // Restrict Staff Managers from deleting data
  if (currentUser.role === "STAFF_MANAGER") {
    return NextResponse.json(
      { error: "Staff Managers do not have permission to delete administrative user profiles." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  // Prevent users from deleting their own active profile
  if (id === currentUser.id) {
    return NextResponse.json({ error: "You cannot delete your own logged-in user profile" }, { status: 400 });
  }

  try {
    // Verify user exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: "User not found" }, { status: 444 });
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE admin user error:", error);
    return NextResponse.json({ error: "Failed to delete admin user" }, { status: 500 });
  }
}
