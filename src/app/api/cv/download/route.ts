import { NextRequest, NextResponse } from "next/server";
import { getCVData } from "@/lib/cvStore";
import { cvTemplate } from "@/lib/cvTemplate";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "edge";

function getSkillDots(skillName: string): number {
  const name = skillName.toLowerCase();
  if (
    name.includes("vue") ||
    name.includes("nuxt") ||
    name.includes("nestjs") ||
    name.includes("tailwind") ||
    name.includes("html") ||
    name.includes("css")
  ) {
    return 5;
  }
  if (
    name.includes("react") ||
    name.includes("next") ||
    name.includes("angular") ||
    name.includes("typescript") ||
    name.includes("laravel") ||
    name.includes("prisma") ||
    name.includes("docker") ||
    name.includes("cloudflare") ||
    name.includes("firebase") ||
    name.includes("git")
  ) {
    return 4;
  }
  return 3;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch latest CV data
    const cv = await getCVData();
    const { profile, experiences, skillGroups, educations, references } = cv;

    // 2. Load the self-contained static template
    let html = cvTemplate;

    // 3. Format Date
    const dateObj = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    // 4. Perform dynamic data replacement in the HTML template

    // Cover Page: Name
    html = html.replace(
      /<!-- START_COVER_NAME -->[\s\S]*?<!-- END_COVER_NAME -->/g,
      `<!-- START_COVER_NAME -->
      <div class="cover-name">${profile.name.first.toUpperCase()} ${profile.name.last.toUpperCase()}</div>
      <!-- END_COVER_NAME -->`
    );

    // Cover Page: Title
    html = html.replace(
      /<!-- START_COVER_TITLE -->[\s\S]*?<!-- END_COVER_TITLE -->/g,
      `<!-- START_COVER_TITLE -->
      <div class="cover-title">${profile.title.toUpperCase()}</div>
      <!-- END_COVER_TITLE -->`
    );

    // Cover Page: Contact
    html = html.replace(
      /<!-- START_CL_CONTACT -->[\s\S]*?<!-- END_CL_CONTACT -->/g,
      `<!-- START_CL_CONTACT -->
      <span>+ ${profile.phones.join(" / ")}</span>
      <span>+ <a href="${profile.website}">${profile.website.replace(/^https?:\/\//, "")}</a></span>
      <span>+ ${profile.location}</span>
      <span>+ <a href="${profile.linkedin}">${profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</a></span>
      <!-- END_CL_CONTACT -->`
    );

    // Cover Page: Date Sidebar
    html = html.replace(
      /<!-- START_CL_DATE -->[\s\S]*?<!-- END_CL_DATE -->/g,
      `<!-- START_CL_DATE -->
      <p style="font-size:7.5pt;color:#555;">${currentDate}<br>${profile.location}</p>
      <!-- END_CL_DATE -->`
    );

    // Cover Page: Main Header Date
    html = html.replace(
      /<!-- START_CL_MAIN_DATE -->[\s\S]*?<!-- END_CL_MAIN_DATE -->/g,
      `<!-- START_CL_MAIN_DATE -->${currentDate} · ${profile.location}<!-- END_CL_MAIN_DATE -->`
    );

    // Cover Page: Key Skills Sidebar
    const sidebarSkillsHtml = skillGroups.map(g => `<li>${g.skills.slice(0, 3).join(" · ")}</li>`).join("\n        ");
    html = html.replace(
      /<!-- START_CL_KEY_SKILLS -->[\s\S]*?<!-- END_CL_KEY_SKILLS -->/g,
      `<!-- START_CL_KEY_SKILLS -->
      <ul>
        ${sidebarSkillsHtml}
      </ul>
      <!-- END_CL_KEY_SKILLS -->`
    );

    // Cover Page: References Sidebar
    const clReferencesHtml = references.map((r, idx) => `
        ${idx > 0 ? "<br>" : ""}<strong>${r.name}</strong><br>
        ${r.role} · ${r.company}<br>
        ${r.contact}`).join("");
    html = html.replace(
      /<!-- START_CL_REFERENCES -->[\s\S]*?<!-- END_CL_REFERENCES -->/g,
      `<!-- START_CL_REFERENCES -->
      <div style="font-size:7.5pt;line-height:1.8;color:#444;">
        ${clReferencesHtml}
      </div>
      <!-- END_CL_REFERENCES -->`
    );

    // Cover Page: Signature
    html = html.replace(
      /<!-- START_CL_SIGNATURE -->[\s\S]*?<!-- END_CL_SIGNATURE -->/g,
      `<!-- START_CL_SIGNATURE -->
      <div class="cover-sign">
        <div class="sig-name">${profile.name.first} ${profile.name.last}</div>
        <div class="sig-title">${profile.title}</div>
      </div>
      <!-- END_CL_SIGNATURE -->`
    );

    // CV Page: Header Name Block
    html = html.replace(
      /<!-- START_CV_NAME_BLOCK -->[\s\S]*?<!-- END_CV_NAME_BLOCK -->/g,
      `<!-- START_CV_NAME_BLOCK -->
      <div class="cv-name-block">
        <div class="cv-name">${profile.name.first.toUpperCase()} ${profile.name.last.toUpperCase()}</div>
        <div class="cv-title">${profile.title.toUpperCase()}</div>
      </div>
      <!-- END_CV_NAME_BLOCK -->`
    );

    // CV Page: Summary
    html = html.replace(
      /<!-- START_CV_SUMMARY -->[\s\S]*?<!-- END_CV_SUMMARY -->/g,
      `<!-- START_CV_SUMMARY -->
      <p class="summary-text">
        ${profile.summary}
      </p>
      <!-- END_CV_SUMMARY -->`
    );

    // CV Page: Experiences
    const experiencesHtml = experiences.map(exp => `
      <div class="exp-block">
        <div class="exp-row">
          <div class="exp-year">${exp.period}</div>
          <div>
            <div class="exp-title">${exp.title}</div>
            <div class="exp-company">${exp.company}, ${exp.location}</div>
          </div>
        </div>
        <ul class="exp-bullets" style="padding-left:70px;">
          ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join("\n          ")}
        </ul>
      </div>`).join("\n");
    html = html.replace(
      /<!-- START_P2_EXPERIENCE -->[\s\S]*?<!-- END_P2_EXPERIENCE -->/g,
      `<!-- START_P2_EXPERIENCE -->
      ${experiencesHtml}
      <!-- END_P2_EXPERIENCE -->`
    );

    // CV Page: Educations
    const educationsHtml = educations.map(edu => `
      <div class="edu-block">
        <div class="edu-row">
          <div class="edu-year">${edu.period}</div>
          <div>
            <div class="edu-degree">${edu.degree}</div>
            <div class="edu-school">${edu.school} · ${edu.location}</div>
            ${edu.description ? `<div class="edu-note">${edu.description}</div>` : ""}
          </div>
        </div>
      </div>`).join("\n");
    html = html.replace(
      /<!-- START_P2_EDUCATION -->[\s\S]*?<!-- END_P2_EDUCATION -->/g,
      `<!-- START_P2_EDUCATION -->
      ${educationsHtml}
      <!-- END_P2_EDUCATION -->`
    );

    // CV Page: References
    const referencesHtml = references.map(ref => `
        <div class="ref-block">
          <div class="ref-name">${ref.name}</div>
          <div class="ref-role">${ref.role} · ${ref.company}</div>
          <div class="ref-contact">${ref.contact}</div>
        </div>`).join("\n");
    html = html.replace(
      /<!-- START_P2_REFERENCES -->[\s\S]*?<!-- END_P2_REFERENCES -->/g,
      `<!-- START_P2_REFERENCES -->
      <div class="ref-grid">
        ${referencesHtml}
      </div>
      <!-- END_P2_REFERENCES -->`
    );

    // CV Page: Contact Sidebar
    html = html.replace(
      /<!-- START_P2_CONTACT -->[\s\S]*?<!-- END_P2_CONTACT -->/g,
      `<!-- START_P2_CONTACT -->
      <ul class="contact-list">
        <li>${profile.phones.join(" / ")}</li>
        <li><a href="${profile.website}">${profile.website.replace(/^https?:\/\//, "")}</a></li>
        <li>${profile.location}</li>
        <li><a href="${profile.telegram}">${profile.telegramHandle || "t.me/lothindev"}</a></li>
        <li><a href="${profile.linkedin}">${profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</a></li>
      </ul>
      <!-- END_P2_CONTACT -->`
    );

    // CV Page: Professional Skills Sidebar
    const skillsHtml = skillGroups.map(group => {
      const rows = group.skills.map(skill => {
        const dots = getSkillDots(skill);
        const dotsHtml = Array.from({ length: 5 }, (_, i) => 
          `<span class="dot${i < dots ? " full" : ""}"></span>`
        ).join("");
        return `
        <div class="skill-row">
          <span class="skill-name">${skill}</span>
          <div class="skill-track">
            <div class="skill-line"></div>
            <div class="dots">${dotsHtml}</div>
          </div>
        </div>`;
      }).join("\n        ");
      return `
      <div class="skill-cat">${group.label}</div>
      ${rows}`;
    }).join("\n");
    html = html.replace(
      /<!-- START_P2_SKILLS -->[\s\S]*?<!-- END_P2_SKILLS -->/g,
      `<!-- START_P2_SKILLS -->
      ${skillsHtml}
      <!-- END_P2_SKILLS -->`
    );

    // CV Page: Languages Sidebar
    const languagesHtml = profile.languages.map(lang => `
        <li>${lang.name} (${lang.level})</li>`).join("\n");
    html = html.replace(
      /<!-- START_P2_LANGUAGE -->[\s\S]*?<!-- END_P2_LANGUAGE -->/g,
      `<!-- START_P2_LANGUAGE -->
      <ul class="lang-list">
        ${languagesHtml}
      </ul>
      <!-- END_P2_LANGUAGE -->`
    );

    // 5. Return response: always serve inline for view-only
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": "inline",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Error generating dynamic CV:", err);
    return NextResponse.json({ error: err.message || "Failed to load CV" }, { status: 500 });
  }
}
