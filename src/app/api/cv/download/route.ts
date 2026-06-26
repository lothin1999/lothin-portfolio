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
    const cvExperiences = experiences.filter(exp => exp.showInCv !== false);

    // 2. Load the self-contained static template
    let html = cvTemplate;

    // 3. Format Date
    const dateObj = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    // 4. Perform dynamic data replacement in the HTML template

    // Unified Premium Letterhead
    const letterheadHtml = `
  <div class="letterhead">
    <div class="lh-left">
      <div class="lh-name">${profile.name.first.toUpperCase()} ${profile.name.last.toUpperCase()}</div>
      <div class="lh-title">${profile.title.toUpperCase()}</div>
      <div class="lh-tagline">${profile.tagline || "3+ Years · Production Systems"}</div>
    </div>
    <div class="lh-right">
      <div class="lh-contact-item">
        <svg class="lh-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
        <span>${profile.phones.join(" / ")}</span>
      </div>
      <div class="lh-contact-item">
        <svg class="lh-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,8L12,13L4,8V6L12,11L20,6V8Z"/></svg>
        <span><a href="mailto:${profile.email}">${profile.email}</a></span>
      </div>
      <div class="lh-contact-item">
        <svg class="lh-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/></svg>
        <span>${profile.location}</span>
      </div>
      <div class="lh-contact-item">
        <svg class="lh-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.07,19.43 4,16.07 4,12C4,9.53 5.15,7.3 6.94,5.89C6.97,6.24 7,6.61 7,7A4,4 0 0,0 11,11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
        <span><a href="${profile.website}" target="_blank">${profile.website.replace(/^https?:\/\//, "")}</a></span>
      </div>
      <div class="lh-contact-item">
        <svg class="lh-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        <span><a href="${profile.linkedin}" target="_blank">${profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")}</a></span>
      </div>
      <div class="lh-contact-item">
        <svg class="lh-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9.78 18.65l.28-4.28 7.68-6.92c.34-.31-.07-.47-.52-.18L7.74 13.3 3.64 12c-.89-.28-.9-.89.19-1.32l16.03-6.18c.74-.27 1.39.18 1.17 1.15l-2.72 12.81c-.19.92-.74 1.15-1.51.71l-4.13-3.05-2 1.93c-.22.22-.4.4-.83.4z"/></svg>
        <span><a href="${profile.telegram}" target="_blank">${profile.telegramHandle || "t.me/lothindev"}</a></span>
      </div>
    </div>
  </div>`;

    // Cover Page Header
    html = html.replace(
      /<!-- START_COVER_LETTERHEAD -->[\s\S]*?<!-- END_COVER_LETTERHEAD -->/g,
      `<!-- START_COVER_LETTERHEAD -->${letterheadHtml}<!-- END_COVER_LETTERHEAD -->`
    );

    // CV Page Header
    html = html.replace(
      /<!-- START_CV_LETTERHEAD -->[\s\S]*?<!-- END_CV_LETTERHEAD -->/g,
      `<!-- START_CV_LETTERHEAD -->${letterheadHtml}<!-- END_CV_LETTERHEAD -->`
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
      <!-- END_COVER_SIGNATURE -->`
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
            ${edu.link ? `<div class="edu-note" style="margin-top:3px;"><a href="${edu.link}" style="color:#555;text-decoration:none;word-break:break-all;">${edu.link}</a></div>` : ""}
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
