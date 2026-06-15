import { NextRequest, NextResponse } from "next/server";
import { getCVData } from "@/lib/cvStore";
import { cvTemplate } from "@/lib/cvTemplate";
import { defaultPhotoBase64 } from "@/lib/defaultPhoto";

export const dynamic = "force-dynamic";
export const runtime = "edge";

function getLangWidth(level: string) {
  const lvl = level.toLowerCase();
  if (lvl.includes("native")) return "100%";
  if (lvl.includes("professional") || lvl.includes("fluent") || lvl.includes("advanced")) return "85%";
  if (lvl.includes("intermediate") || lvl.includes("medium")) return "65%";
  return "50%";
}

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch latest CV data (from Cloudflare R2 / Supabase)
    const cv = await getCVData();
    const { profile, experiences, skillGroups, educations, references } = cv;

    // 2. Load the self-contained static template
    let html = cvTemplate;

    // 3. Format Date
    const dateObj = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    // 4. Perform dynamic data replacement in the HTML template
    
    // Name (Cover Letter Page 1 Header)
    html = html.replace(
      /Thoeun <em style="font-style:italic; color:#c4a882;">Lothin<\/em>/g,
      `${profile.name.first} <em style="font-style:italic; color:#c4a882;">${profile.name.last}</em>`
    );

    // Job Title (Cover Letter Page 1 Header)
    html = html.replace(
      /<div style="margin-top:8px; font-size:10px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#c4a882;">Full-Stack Developer<\/div>/g,
      `<div style="margin-top:8px; font-size:10px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#c4a882;">${profile.title}</div>`
    );

    // Contact details (Cover Letter Page 1 Header)
    html = html.replace(
      /<!-- START_CL_CONTACT -->[\s\S]*?<!-- END_CL_CONTACT -->/,
      `<!-- START_CL_CONTACT -->
      <div style="font-size:11px; color:#9a8a78; line-height:1.9; font-weight:300; text-align:right;">
        <div style="color:#e8dece;">${profile.phones.join(' &nbsp;/&nbsp; ')}</div>
        <div><a href="${profile.website}" style="color:#c4a882; text-decoration:none;">${profile.website.replace(/^https?:\/\//, '')}</a></div>
        <div><a href="${profile.telegram}" style="color:#c4a882; text-decoration:none;">${profile.telegram.replace(/^https?:\/\//, '')}</a></div>
        <div><a href="${profile.linkedin}" style="color:#c4a882; text-decoration:none;">${profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin.com/in/')}</a></div>
        <div style="margin-top:4px;">${profile.location} &nbsp;·&nbsp; ${currentDate}</div>
      </div>
      <!-- END_CL_CONTACT -->`
    );

    // Date/Location (Cover Letter Page 1 Sidebar)
    html = html.replace(
      /<!-- START_CL_DATE -->[\s\S]*?<!-- END_CL_DATE -->/,
      `<!-- START_CL_DATE -->
      <div style="font-size:8.5px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #2e2820;">Date</div>
      <div style="font-size:11.5px; color:#e8dece; font-weight:300; margin-bottom:28px; line-height:1.8;">${currentDate}<br>${profile.location}</div>
      <!-- END_CL_DATE -->`
    );

    // Key Skills (Cover Letter Page 1 Sidebar)
    const sidebarSkillsHtml = skillGroups.map(g => g.skills.slice(0, 3).join(" · ")).join("<br>\n        ");
    html = html.replace(
      /<!-- START_CL_KEY_SKILLS -->[\s\S]*?<!-- END_CL_KEY_SKILLS -->/,
      `<!-- START_CL_KEY_SKILLS -->
      <div style="font-size:8.5px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #2e2820;">Key Skills</div>
      <div style="font-size:11.5px; color:#b0a090; line-height:2.1; font-weight:300; margin-bottom:28px;">
        ${sidebarSkillsHtml}
      </div>
      <!-- END_CL_KEY_SKILLS -->`
    );

    // References (Cover Letter Page 1 Sidebar)
    const sidebarReferencesHtml = references.map(r => `
        <div style="color:#c4a882; font-weight:500; margin-top:4px;">${r.name}</div>
        <div style="color:#9a8a78; font-size:10.5px;">${r.role}</div>
        <div style="color:#9a8a78; font-size:10.5px;">${r.company}</div>
        <div style="color:#9a8a78; font-size:10.5px; margin-bottom:14px;">${r.contact}</div>`).join('');
    html = html.replace(
      /<!-- START_CL_REFERENCES -->[\s\S]*?<!-- END_CL_REFERENCES -->/,
      `<!-- START_CL_REFERENCES -->
      <div style="font-size:8.5px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #2e2820;">References</div>
      <div style="font-size:11.5px; color:#e8dece; font-weight:300; line-height:1.8;">
        ${sidebarReferencesHtml}
      </div>
      <!-- END_CL_REFERENCES -->`
    );

    // Signature Block (Cover Letter Page 1 Bottom)
    html = html.replace(
      /<!-- START_CL_SIGNATURE -->[\s\S]*?<!-- END_CL_SIGNATURE -->/,
      `<!-- START_CL_SIGNATURE -->
      <!-- Signature -->
      <div style="border-top:1px solid #e2d9cc; padding-top:28px;">
        <div style="font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; font-style:italic; color:#6b4f2a; letter-spacing:0.5px; margin-bottom:5px;">${profile.name.first} ${profile.name.last}</div>
        <div style="font-size:10px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:#7a6e62;">${profile.title}</div>
        <div style="font-size:11px; color:#7a6e62; margin-top:3px; font-weight:300;">${profile.location}</div>
      </div>
      <!-- END_CL_SIGNATURE -->`
    );

    // Page 2 - Main Header Accent and Name
    html = html.replace(
      /<!-- START_P2_HEADER -->[\s\S]*?<!-- END_P2_HEADER -->/,
      `<!-- START_P2_HEADER -->
      <!-- HEADER -->
      <div class="header">
        <div class="header-accent">
          <div class="label">${profile.title}</div>
          <div class="name"><em>${profile.name.first}</em><br>${profile.name.last}</div>
        </div>
        <div class="header-main">
          <div class="title-line">
            <span class="job-title">${profile.tagline}</span>
          </div>
          <p class="header-summary">
            ${profile.summary}
          </p>
        </div>
      <!-- END_P2_HEADER -->`
    );

    // Page 2 - Profile Photo
    let photoHtml = `<div class="photo-initials">${profile.name.first[0]}${profile.name.last[0]}</div>`;
    if (profile.photoUrl) {
      let photoUrl = profile.photoUrl;
      if (photoUrl.startsWith("/")) {
        const origin = req.nextUrl.origin;
        photoUrl = `${origin}${photoUrl}`;
      }
      photoHtml = `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
      photoHtml = `<img src="${defaultPhotoBase64}" style="width: 100%; height: 100%; object-fit: cover;" />`;
    }
    html = html.replace(
      /<!-- START_P2_PHOTO -->[\s\S]*?<!-- END_P2_PHOTO -->/,
      `<!-- START_P2_PHOTO -->
      <div class="header-photo">
        ${photoHtml}
      </div>
      <!-- END_P2_PHOTO -->`
    );

    // Page 2 - Contact Sidebar
    html = html.replace(
      /<!-- START_P2_CONTACT -->[\s\S]*?<!-- END_P2_CONTACT -->/,
      `<!-- START_P2_CONTACT -->
      <div class="section">
        <div class="section-title">Contact</div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span class="contact-text">${profile.location}</span>
        </div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
          <span class="contact-text"><a href="${profile.website}">${profile.website.replace(/^https?:\/\//, '')}</a></span>
        </div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.5 4.5L2.5 10.5l7 2.5m12-8.5l-5 15-5-7.5m10-7.5l-12 8"/></svg>
          <span class="contact-text"><a href="${profile.telegram}">${profile.telegramHandle || 'Telegram'}</a></span>
        </div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          <span class="contact-text">${profile.phones.join(' &nbsp;/&nbsp; ')}</span>
        </div>
        <div class="contact-item">
          <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          <span class="contact-text"><a href="${profile.linkedin}">${profile.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin.com/in/')}</a></span>
        </div>
      </div>
      <!-- END_P2_CONTACT -->`
    );

    // Page 2 - Skills Sidebar
    const hiKeywords = ["vue", "nuxt", "react", "next", "nestjs", "laravel", "spring boot", "docker", "cloudflare", "firebase", "bakong", "khqr", "typescript", "google ai", "gemini", "model training"];
    const skillsHtml = skillGroups.map(group => `
      <div class="skill-block">
        <div class="skill-block-label">${group.label}</div>
        <div class="skill-list">
          ${group.skills.map(skill => {
            const isHi = hiKeywords.some(kw => skill.toLowerCase().includes(kw));
            return `<span class="skill-pill${isHi ? ' hi' : ''}">${skill}</span>`;
          }).join('\n          ')}
        </div>
      </div>`).join('\n');
    html = html.replace(
      /<!-- START_P2_SKILLS -->[\s\S]*?<!-- END_P2_SKILLS -->/,
      `<!-- START_P2_SKILLS -->
      <div class="section">
        <div class="section-title">Skills</div>
        ${skillsHtml}
      </div>
      <!-- END_P2_SKILLS -->`
    );

    // Page 2 - Language Sidebar
    const languagesHtml = profile.languages.map((lang, idx) => `
      <div${idx > 0 ? ' style="margin-top:12px"' : ''}>
        <div class="lang-row">
          <span class="lang-name">${lang.name}</span>
          <span class="lang-level">${lang.level}</span>
        </div>
        <div class="lang-bar-track"><div class="lang-bar-fill" style="width:${getLangWidth(lang.level)}"></div></div>
      </div>`).join('\n');
    html = html.replace(
      /<!-- START_P2_LANGUAGE -->[\s\S]*?<!-- END_P2_LANGUAGE -->/,
      `<!-- START_P2_LANGUAGE -->
      <div class="section" style="page-break-before: always; padding-top: 36px;">
        <div class="section-title">Language</div>
        ${languagesHtml}
      </div>
      <!-- END_P2_LANGUAGE -->`
    );

    // Page 2 - Experience Section
    const experiencesHtml = experiences.map(exp => `
      <div class="exp-item">
        <div class="exp-meta">
          <div class="exp-role">${exp.title}</div>
          <div class="exp-date">${exp.period}</div>
        </div>
        <div class="exp-company">${exp.company} &nbsp;·&nbsp; ${exp.location}</div>
        <ul class="exp-bullets">
          ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('\n          ')}
        </ul>
      </div>`).join('\n');
    html = html.replace(
      /<!-- START_P2_EXPERIENCE -->[\s\S]*?<!-- END_P2_EXPERIENCE -->/,
      `<!-- START_P2_EXPERIENCE -->
      <div class="section">
        <div class="section-title">Experience</div>
        ${experiencesHtml}
      </div>
      <!-- END_P2_EXPERIENCE -->`
    );

    // Page 2 - Education Section
    const educationsHtml = educations.map(edu => `
      <div class="edu-row">
        <div class="edu-year">${edu.period}</div>
        <div class="edu-info">
          <div class="edu-degree">${edu.degree}</div>
          <div class="edu-school">${edu.school} &nbsp;·&nbsp; ${edu.location}</div>
          ${edu.description ? `<div style="font-size:11px;color:#9a8a78;margin-top:6px;font-weight:300;line-height:1.7;">${edu.description}</div>` : ''}
          ${edu.courses && edu.courses.length > 0 ? `
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
              ${edu.courses.map(c => `<span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">${c}</span>`).join('\n              ')}
            </div>
          ` : ''}
        </div>
      </div>`).join('\n');
    html = html.replace(
      /<!-- START_P2_EDUCATION -->[\s\S]*?<!-- END_P2_EDUCATION -->/,
      `<!-- START_P2_EDUCATION -->
      <div class="section" style="page-break-before: always; padding-top: 36px;">
        <div class="section-title">Education</div>
        ${educationsHtml}
      </div>
      <!-- END_P2_EDUCATION -->`
    );

    // Page 2 - References Section
    const referencesHtml = references.map(ref => `
      <div class="ref-card">
        <div class="ref-name">${ref.name}</div>
        <div class="ref-role">${ref.role} &nbsp;·&nbsp; ${ref.company}</div>
        <div class="ref-link">${ref.contact}</div>
      </div>`).join('\n');
    html = html.replace(
      /<!-- START_P2_REFERENCES -->[\s\S]*?<!-- END_P2_REFERENCES -->/,
      `<!-- START_P2_REFERENCES -->
      <div class="section">
        <div class="section-title">References</div>
        <div class="ref-grid">
          ${referencesHtml}
        </div>
      </div>
      <!-- END_P2_REFERENCES -->`
    );

    // Return the completed dynamically modified HTML file download
    const filename = `${profile.name.first.toUpperCase()} ${profile.name.last.toUpperCase()} CV & LETTER HEAD.html`;
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });

  } catch (err: any) {
    console.error("Error generating dynamic CV download:", err);
    return NextResponse.json({ error: err.message || "Failed to download CV" }, { status: 500 });
  }
}
