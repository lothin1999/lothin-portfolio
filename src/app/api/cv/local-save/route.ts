import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return NextResponse.json({ error: "Not supported in Edge runtime" }, { status: 405 });
  }

  try {
    const fs = eval('require("fs/promises")');
    const path = eval('require("path")');
    const filePath = path.join(process.cwd(), "cv.json");
    const raw = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch (err) {
    return NextResponse.json({ error: "Failed to read local cv.json" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return NextResponse.json({ error: "Not supported in Edge runtime" }, { status: 405 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "upload") {
    try {
      const fs = eval('require("fs/promises")');
      const path = eval('require("path")');

      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const extension = file.name.split(".").pop() || "jpg";
      const filename = `profile-${Date.now()}.${extension}`;

      const publicDir = path.join(process.cwd(), "public", "images");
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, filename), new Uint8Array(buffer));

      return NextResponse.json({ url: `/images/${filename}` });
    } catch (err: any) {
      console.error("Local upload error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Default action: save CV data
  try {
    const fs = eval('require("fs/promises")');
    const path = eval('require("path")');

    const body = await req.json();
    const filePath = path.join(process.cwd(), "cv.json");
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Local save error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
