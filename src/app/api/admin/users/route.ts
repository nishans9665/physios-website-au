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

// GET all admin users
export async function GET(req: Request) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("GET admin users error:", error);
    return NextResponse.json({ error: "Failed to retrieve admin users" }, { status: 500 });
  }
}

// POST create a new admin user
export async function POST(req: Request) {
  const currentUser = await verifyAuth();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields: name, email, and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "An admin user with this email address already exists" }, { status: 400 });
    }

    // Hash the password safely using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newAdmin }, { status: 201 });
  } catch (error) {
    console.error("POST create admin user error:", error);
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 });
  }
}
