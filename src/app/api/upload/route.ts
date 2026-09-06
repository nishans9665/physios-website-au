import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".pdf"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

// Dangerous extensions to strictly block (script/executable files)
const DISALLOWED_EXTENSIONS = new Set([
  "php", "phtml", "php3", "php4", "php5", "phps", "js", "jsx", "ts", "tsx",
  "html", "htm", "shtml", "xhtml", "py", "pyw", "sh", "bash", "bat", "cmd",
  "exe", "dll", "vbs", "ps1", "psm1", "asp", "aspx", "cgi", "pl", "jsp",
  "jar", "svg", "xml", "htaccess", "config", "env", "phar"
]);

/**
 * Validates file magic bytes (file header binary signature)
 * to prevent extension spoofing & malicious file disguise.
 */
function validateMagicBytes(buffer: Buffer, fileExt: string): boolean {
  if (buffer.length < 4) return false;

  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47; // \x89PNG
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff; // JPEG SOI

  if (fileExt === ".pdf" && isPdf) return true;
  if (fileExt === ".png" && isPng) return true;
  if ((fileExt === ".jpg" || fileExt === ".jpeg") && isJpeg) return true;

  return false;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. File Size Validation (Max 10MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the maximum allowed limit of 10MB." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }

    const fileNameLower = file.name.toLowerCase();
    const nameParts = fileNameLower.split(".");

    if (nameParts.length < 2) {
      return NextResponse.json(
        { error: "File lacks a valid file extension." },
        { status: 400 }
      );
    }

    const fileExt = "." + nameParts[nameParts.length - 1];

    // 2. Extension Restriction (JPEG, PNG, PDF only)
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    // 3. Security: Check for double extension or embedded script names
    const hasScriptExtension = nameParts.some((part) => DISALLOWED_EXTENSIONS.has(part));
    if (hasScriptExtension) {
      return NextResponse.json(
        { error: "Security check failed: Executable or script file extension detected." },
        { status: 400 }
      );
    }

    // 4. MIME Type Validation
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid MIME type. Only JPEG, PNG, and PDF files are allowed." },
        { status: 400 }
      );
    }

    // 5. Binary Magic Bytes Validation (Header Signature)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, fileExt)) {
      return NextResponse.json(
        { error: "Security check failed: File content does not match genuine JPEG, PNG, or PDF format." },
        { status: 400 }
      );
    }

    // 6. Ensure target directory exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 7. Safe UUID filename generation
    const safeName = `${randomUUID()}${fileExt}`;
    const filePath = join(uploadDir, safeName);

    // Save locally
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeName}`;

    return NextResponse.json(
      {
        success: true,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "Failed to process and store upload securely." }, { status: 500 });
  }
}

