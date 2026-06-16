import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";

declare const process: {
  env: {
    CLOUDFLARE_ACCOUNT_ID?: string;
    CLOUDFLARE_AI_API_TOKEN?: string;
    [key: string]: string | undefined;
  };
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.ip || req.headers.get("cf-connecting-ip") || "127.0.0.1";

  // Rate limit: Max 10 transcriptions per 1 minute (60,000 ms)
  const { limited, retryAfter } = isRateLimited(ip, {
    intervalMs: 60 * 1000,
    maxRequests: 10,
    limitName: "transcribe",
  });

  if (limited) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `You are transcribing too quickly. Please wait ${retryAfter} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN;

  if (!accountId || !apiToken || apiToken === "your_token_here") {
    return NextResponse.json(
      {
        error: "Missing Cloudflare Credentials",
        message: "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN must be configured. Please generate a valid Workers AI token and replace the placeholder value.",
      },
      { status: 500 }
    );
  }

  try {
    const audioBuffer = await req.arrayBuffer();
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty audio data" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper-large-v3-turbo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/octet-stream",
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Cloudflare Workers AI Whisper failed:", errText);
      return NextResponse.json(
        { error: "Transcription failed", message: errText },
        { status: response.status }
      );
    }

    const json = await response.json();
    if (!json.success) {
      return NextResponse.json(
        { error: "Transcription failed", message: JSON.stringify(json.errors) },
        { status: 500 }
      );
    }

    const text = json.result?.text || "";
    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Internal Server Error in transcribe route:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
