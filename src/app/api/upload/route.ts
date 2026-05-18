import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Please upload PDF, Word Doc, or Images (JPG/PNG)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Generate safe, unique file name
    const fileExt = file.name.substring(file.name.lastIndexOf("."));
    const safeName = `${randomUUID()}${fileExt}`;
    const filePath = join(uploadDir, safeName);

    // Save locally
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeName}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Failed to upload file to local storage" }, { status: 500 });
  }
}
