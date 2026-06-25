import { NextResponse } from "next/server";
import { getCVData } from "@/lib/cvStore";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    const cv = await getCVData();
    const { profile, experiences, skillGroups, educations, references } = cv;

    const experiencesMarkdown = experiences.map(exp => `
### ${exp.title}
- **Company**: ${exp.company}
- **Location**: ${exp.location}
- **Period**: ${exp.period}
- **Key Responsibilities**:
${exp.bullets.map(b => `  - ${b}`).join("\n")}
- **Technologies Used**: ${exp.tags.join(", ")}
`).join("\n");

    const skillGroupsMarkdown = skillGroups.map(group => `
### ${group.label}
- ${group.skills.join(", ")}
`).join("\n");

    const educationsMarkdown = educations.map(edu => `
### ${edu.degree}
- **School**: ${edu.school}
- **Location**: ${edu.location}
- **Period**: ${edu.period}
${edu.description ? `- **Details**: ${edu.description}` : ""}
${edu.link ? `- **Link**: ${edu.link}` : ""}
${edu.courses && edu.courses.length > 0 ? `- **Key Courses**: ${edu.courses.join(", ")}` : ""}
`).join("\n");

    const referencesMarkdown = references.map(ref => `
- **Name**: ${ref.name}
  - **Role**: ${ref.role}
  - **Company**: ${ref.company}
`).join("\n");

    const markdown = `# Thoeun Lothin — Senior Full-Stack Web Developer

## Profile Overview
- **Title**: ${profile.title}
- **Tagline**: ${profile.tagline || "3+ Years · Production Systems"}
- **Location**: ${profile.location}
- **Summary**: ${profile.summary}
- **Website**: ${profile.website}
- **Telegram**: ${profile.telegramHandle || "@lothindev"} (${profile.telegram})
- **LinkedIn**: ${profile.linkedin}
- **Email**: ${profile.email || "lothininfo@gmail.com"}
- **Phones**: ${profile.phones.join(" / ")}

## Key Technical Ecosystems
${skillGroupsMarkdown}

## Professional & Volunteer Experience
${experiencesMarkdown}

## Education
${educationsMarkdown}

## References
${referencesMarkdown}
`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err: any) {
    console.error("Error generating llms.txt:", err);
    return new NextResponse("Error generating llms.txt", { status: 500 });
  }
}
