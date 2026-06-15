import { NextRequest, NextResponse } from "next/server";
import { getCVData } from "@/lib/cvStore";

declare const process: {
  env: {
    CLOUDFLARE_ACCOUNT_ID?: string;
    CLOUDFLARE_API_TOKEN?: string;
    [key: string]: string | undefined;
  };
};

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken || apiToken === "your_token_here") {
    return NextResponse.json(
      {
        error: "Missing Cloudflare Credentials",
        message: "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be configured in your .env file. Please generate a valid Workers AI token and replace the placeholder value.",
      },
      { status: 500 }
    );
  }

  try {
    const { messages, model } = await req.json();
    const modelToUse = model || "@cf/meta/llama-3.1-8b-instruct";

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request payload. 'messages' array is required." }, { status: 400 });
    }

    // Fetch the CV/Portfolio data dynamically
    const cvData = await getCVData();

    // Sanitize and serialize the portfolio data to keep it concise but detailed
    const portfolioContext = {
      profile: {
        name: `${cvData.profile?.name?.first || ""} ${cvData.profile?.name?.last || ""}`.trim(),
        title: cvData.profile?.title,
        tagline: cvData.profile?.tagline,
        summary: cvData.profile?.summary,
        location: cvData.profile?.location,
        languages: cvData.profile?.languages,
        contacts: {
          telegram: cvData.profile?.telegramHandle || "@lothin01",
          phone: cvData.profile?.phones || ["098 63 88 78"],
          website: cvData.profile?.website || "https://lothin-portfolio.pages.dev",
        },
      },
      experiences: cvData.experiences?.map((exp) => ({
        role: exp.title,
        company: exp.company,
        location: exp.location,
        period: exp.period,
        bullets: exp.bullets,
        skillsUsed: exp.tags,
      })),
      skills: cvData.skillGroups?.map((group) => ({
        category: group.label,
        items: group.skills,
      })),
      education: cvData.educations?.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        location: edu.location,
        period: edu.period,
        description: edu.description,
        courses: edu.courses,
      })),
      articles: cvData.articles?.map((art) => ({
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        date: art.date,
        tags: art.tags,
      })),
    };

    // Construct a strong, restrictive system prompt
    const systemPrompt = `You are the official AI Assistant for Thoeun Lothin's personal portfolio website (lothin.dev).
Your primary role is to answer questions about Thoeun Lothin's professional background, skills, projects, experience, articles, and education.

Here is the verified portfolio data of Thoeun Lothin:
${JSON.stringify(portfolioContext, null, 2)}

Strict Conversation Guidelines:
1. ONLY answer questions directly related to Thoeun Lothin, his skills, experience, portfolio, projects, work, articles, or professional details.
2. If the user asks about anything unrelated (such as cooking recipes, unrelated programming tasks, general knowledge facts, other developers, mathematical formulas, history, pop culture, or asking you to write general code unrelated to his projects), politely decline and state that you are only programmed to discuss Lothin's portfolio. 
   - Good response style: "I am Lothin's portfolio assistant. I can only answer questions about Lothin's background, skills, and projects. Please let me know if you would like to hear about his experience or stack!"
3. Output responses using clean, simple markdown formatting (bullet points, bold text). Keep responses concise, clear, and professional.
4. Keep the tone friendly, modern, and engaging. Avoid robotic phrasing.
5. If the user asks how to get in touch, suggest using Telegram (${portfolioContext.profile.contacts.telegram}) or phone (${portfolioContext.profile.contacts.phone.join(" / ")}).
`;

    // Format the conversation history
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "cf-aig-gateway-id": "default",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelToUse,
          input: {
            messages: apiMessages,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudflare Workers AI request failed:", errorText);
      return NextResponse.json(
        {
          error: "Cloudflare API Error",
          message: `The Cloudflare AI service returned an error (${response.status}): ${errorText}`,
        },
        { status: response.status }
      );
    }

    const json = await response.json();
    
    if (!json.success) {
      console.error("Cloudflare Workers AI request failed in body:", json.errors);
      return NextResponse.json(
        {
          error: "Cloudflare API Error",
          message: json.errors?.[0]?.message || "The Cloudflare request succeeded but returned success: false.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      response: json.result?.response || "I'm sorry, I couldn't generate a response. Please try again.",
    });
  } catch (err: any) {
    console.error("Internal Server Error in chat route:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
