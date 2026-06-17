import { NextRequest, NextResponse } from "next/server";

const AUTH = process.env.ADMIN_PASSWORD ?? "redistrict2026";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-password") !== AUTH) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      const { put } = await import("@vercel/blob");
      const blob = await put(
        `redistrict/watches/${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
        file,
        { access: "public", token: blobToken }
      );
      return NextResponse.json({ url: blob.url });
    }

    // No blob — convert to base64 data URL (dev/demo only)
    const buffer = await file.arrayBuffer();
    const b64    = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${b64}`;
    return NextResponse.json({ url: dataUrl, local: true });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
