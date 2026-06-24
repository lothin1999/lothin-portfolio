export const cvTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thoeun Lothin — CV & Cover Letter</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    background: #c8c8c8;
    color: #1a1a1a;
    font-size: 8.5pt;
    line-height: 1.45;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    background: #f0f0f0;
    margin: 20px auto;
    padding: 14mm 14mm 12mm 14mm;
    box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    position: relative;
  }

  /* ── DYNAMIC PREMIUM LETTERHEAD ── */
  .letterhead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 3.5px double #6b4f2a;
  }
  .lh-left {
    flex: 1;
  }
  .lh-name {
    font-family: 'EB Garamond', serif;
    font-size: 32pt;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 0.95;
    color: #1a1a1a;
  }
  .lh-title {
    font-size: 7.5pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #6b4f2a;
    margin-top: 5px;
    font-weight: 600;
  }
  .lh-tagline {
    font-size: 6.5pt;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #666;
    margin-top: 3px;
    font-weight: 400;
  }
  .lh-right {
    display: grid;
    grid-template-columns: repeat(2, auto);
    column-gap: 20px;
    row-gap: 6px;
    justify-content: end;
    font-size: 7.5pt;
    color: #444;
  }
  .lh-contact-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .lh-icon {
    width: 9.5pt;
    height: 9.5pt;
    color: #6b4f2a;
    flex-shrink: 0;
  }
  .lh-contact-item a {
    color: #444;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }
  .lh-contact-item a:hover {
    color: #6b4f2a;
    text-decoration: underline;
  }

  .cover-body {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 24px;
    margin-top: 14px;
  }
  .cover-sidebar {
    font-size: 7.5pt;
    color: #333;
  }
  .cover-sidebar .cs-label {
    font-size: 6.5pt;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    font-weight: 700;
    color: #1a1a1a;
    border-bottom: 1px solid #1a1a1a;
    padding-bottom: 3px;
    margin-bottom: 7px;
    margin-top: 14px;
  }
  .cover-sidebar .cs-label:first-child { margin-top: 0; }
  .cover-sidebar ul { list-style: none; }
  .cover-sidebar ul li { padding: 2px 0; }
  .cover-sidebar ul li::before { content: "+ "; color: #888; }

  .cover-main .cover-date {
    font-size: 7.5pt;
    color: #888;
    margin-bottom: 16px;
  }
  .cover-main p {
    font-size: 8.5pt;
    line-height: 1.65;
    color: #2a2a2a;
    margin-bottom: 12px;
    text-align: justify;
  }
  .cover-sign {
    margin-top: 22px;
  }
  .cover-sign .sig-name {
    font-family: 'EB Garamond', serif;
    font-size: 16pt;
    font-weight: 700;
    color: #1a1a1a;
  }
  .cover-sign .sig-title {
    font-size: 6.5pt;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #666;
    margin-top: 2px;
  }

  /* ── CV PAGE ── */


  .cv-layout {
    display: grid;
    grid-template-columns: 1fr 170px;
    gap: 22px;
  }

  /* Shared section label */
  .sec-label {
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: #1a1a1a;
    margin-bottom: 5px;
  }
  .sec-rule {
    border: none;
    border-top: 1px solid #888;
    margin-bottom: 10px;
  }

  /* Summary */
  .summary-text {
    font-size: 8pt;
    line-height: 1.6;
    color: #333;
    text-align: justify;
  }

  /* Experience */
  .exp-block { margin-bottom: 14px; }
  .exp-row {
    display: grid;
    grid-template-columns: 62px 1fr;
    gap: 8px;
    margin-bottom: 3px;
  }
  .exp-year {
    font-size: 7pt;
    font-weight: 600;
    color: #555;
    padding-top: 1px;
    white-space: nowrap;
  }
  .exp-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #1a1a1a;
  }
  .exp-company {
    font-size: 7.5pt;
    color: #666;
    font-style: italic;
    margin-bottom: 4px;
  }
  .exp-bullets {
    list-style: none;
    padding-left: 0;
  }
  .exp-bullets li {
    font-size: 7.5pt;
    color: #333;
    padding: 2px 0 2px 12px;
    position: relative;
    line-height: 1.5;
  }
  .exp-bullets li::before {
    content: "•";
    position: absolute;
    left: 2px;
    color: #888;
  }

  /* Education */
  .edu-block { margin-bottom: 10px; }
  .edu-row {
    display: grid;
    grid-template-columns: 62px 1fr;
    gap: 8px;
  }
  .edu-year {
    font-size: 7pt;
    font-weight: 600;
    color: #555;
    padding-top: 1px;
  }
  .edu-degree {
    font-size: 8pt;
    font-weight: 700;
    color: #1a1a1a;
  }
  .edu-school {
    font-size: 7.5pt;
    color: #666;
    font-style: italic;
  }
  .edu-note {
    font-size: 7pt;
    color: #888;
    margin-top: 2px;
  }

  /* References */
  .ref-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 4px;
  }
  .ref-block {
    text-align: center;
    font-size: 7pt;
    line-height: 1.7;
  }
  .ref-name { font-weight: 700; font-size: 7.5pt; }
  .ref-role { color: #666; }
  .ref-contact { color: #444; }

  /* RIGHT COLUMN */
  .right-col {}

  /* Contact */
  .contact-list {
    list-style: none;
    font-size: 7.5pt;
    color: #333;
    line-height: 2;
  }
  .contact-list li::before { content: "+ "; color: #888; }
  .contact-list a { color: #333; text-decoration: none; }

  /* Skills */
  .skill-cat {
    font-size: 7pt;
    font-weight: 700;
    color: #1a1a1a;
    margin-top: 9px;
    margin-bottom: 5px;
    letter-spacing: 0.2px;
  }
  .skill-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    gap: 4px;
    width: 100%;
    overflow: hidden;
  }
  .skill-name {
    font-size: 7.5pt;
    color: #333;
    flex: 1 1 0;
    min-width: 0;
    white-space: normal;
    word-break: break-word;
    line-height: 1.3;
  }
  .skill-track {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    align-self: center;
  }
  .skill-line {
    width: 28px;
    height: 0.7px;
    background: #aaa;
    flex-shrink: 0;
  }
  .dots {
    display: flex;
    gap: 2.5px;
    flex-shrink: 0;
  }
  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #c0bcb8;
    flex-shrink: 0;
  }
  .dot.full { background: #1a1a1a; }

  /* Personal skills */
  .personal-list {
    list-style: none;
    font-size: 7.5pt;
    color: #333;
    line-height: 1.9;
  }
  .personal-list li::before { content: "• "; color: #888; }

  /* Languages */
  .lang-list {
    list-style: none;
    font-size: 7.5pt;
    color: #333;
    line-height: 1.9;
  }
  .lang-list li::before { content: "• "; color: #888; }

  @media print {
    body { background: white; padding: 0; }
    .page { margin: 0; box-shadow: none; page-break-after: always; background: white; }
    .page:last-child { page-break-after: avoid; }
  }
</style>
</head>
<body>

<!-- ══════════════════════════════════════════ -->
<!--                COVER LETTER               -->
<!-- ══════════════════════════════════════════ -->
<div class="page">

  <!-- START_COVER_LETTERHEAD -->
  <div class="letterhead">
    <div class="lh-left">
      <div class="lh-name">THOEUN LOTHIN</div>
      <div class="lh-title">FULL-STACK WEB DEVELOPER</div>
      <div class="lh-tagline">3+ Years · Production Systems</div>
    </div>
    <div class="lh-right">
      <!-- Contact details -->
    </div>
  </div>
  <!-- END_COVER_LETTERHEAD -->

  <div class="cover-body">
    <div class="cover-sidebar">
      <div class="cs-label">DATE</div>
      <!-- START_CL_DATE -->
      <p style="font-size:7.5pt;color:#555;">June 2026<br>Phnom Penh, Cambodia</p>
      <!-- END_CL_DATE -->

      <div class="cs-label">KEY SKILLS</div>
      <!-- START_CL_KEY_SKILLS -->
      <ul>
        <li>Vue.js / Nuxt 2·3·4</li>
        <li>Next.js</li>
        <li>Angular / TypeScript</li>
        <li>NestJS / Laravel</li>
        <li>Spring Boot</li>
        <li>Docker / Cloudflare</li>
        <li>Firebase / Firestore</li>
        <li>Bakong KHQR</li>
        <li>Google AI Studio</li>
      </ul>
      <!-- END_CL_KEY_SKILLS -->

      <div class="cs-label">REFERENCES</div>
      <!-- START_CL_REFERENCES -->
      <div style="font-size:7.5pt;line-height:1.8;color:#444;">
        <strong>Pheap Sopheaktra</strong><br>
        Full-Stack Dev · IDG<br>
        096 92 84 202<br><br>
        <strong>Sopheak HUN</strong><br>
        Backend Developer<br>
        TurboTech Co., LTD<br>
        +855 93 259 390
      </div>
      <!-- END_CL_REFERENCES -->
    </div>

    <div class="cover-main">
      <div class="cover-date"><!-- START_CL_MAIN_DATE -->June 2026 · Phnom Penh, Cambodia<!-- END_CL_MAIN_DATE --></div>
      <p>Dear Hiring Manager,</p>
      <p>
        I am writing to express my strong interest in the Full-Stack Web Developer position. With over three years of professional experience delivering enterprise-grade web applications, nationwide marketplace solutions, and real-time transaction platforms, I have built a robust technical foundation that enables me to design, build, and optimize scalable digital products from end to end.
      </p>
      <p>
        My primary technical stack covers modern front-end frameworks (Vue.js/Nuxt, React/Next.js, and Angular) integrated with powerful back-end frameworks (NestJS, Laravel, and Spring Boot). I specialize in designing and deploying systems on Cloudflare edge network infrastructure and Firebase real-time databases, while configuring robust deployment environments with Docker, Nginx, and Ubuntu servers.
      </p>
      <p>
        Throughout my career at IDG Technology Solutions, I have led complex architectural initiatives, including:
      </p>
      <p style="padding-left: 12px; margin-bottom: 8px;">
        &bull; <strong>Framework &amp; Backend Migrations:</strong> Managed the end-to-end upgrade of a high-traffic POS and billing platform through three major Nuxt versions (Nuxt 2 &rarr; 3 &rarr; 4) adopting the Composition API, and migrated a legacy Laravel API to a modular, type-safe NestJS + Prisma monorepo with strict DTO validation.
      </p>
      <p style="padding-left: 12px; margin-bottom: 8px;">
        &bull; <strong>Cambodia-Native Integrations:</strong> Successfully implemented the national Bakong KHQR payment system, merchant onboarding webhooks, and secure SMS OTP verification gateways across POS and Banking platforms.
      </p>
      <p style="padding-left: 12px; margin-bottom: 12px;">
        &bull; <strong>AI-Powered Features:</strong> Fine-tuned LLMs and engineered prompt chains via Google AI Studio (Gemini) to build smart search, auto-classification, and data analysis modules.
      </p>
      <p>
        I take pride in writing clean, self-documenting code, designing clear RESTful API contracts with Swagger, and validating endpoints with Postman. I am looking for a challenging role where I can apply my experience in performance optimization, responsive UI development, and payment integrations to help your team achieve its engineering goals.
      </p>
      <p>
        Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications in more detail.
      </p>

      <!-- START_CL_SIGNATURE -->
      <div class="cover-sign">
        <div class="sig-name">Thoeun Lothin</div>
        <div class="sig-title">Full-Stack Web Developer</div>
      </div>
      <!-- END_CL_SIGNATURE -->
    </div>
  </div>

</div><!-- /cover page -->


<!-- ══════════════════════════════════════════ -->
<!--                  CV PAGE                  -->
<!-- ══════════════════════════════════════════ -->
<div class="page">

  <!-- START_CV_LETTERHEAD -->
  <div class="letterhead">
    <div class="lh-left">
      <div class="lh-name">THOEUN LOTHIN</div>
      <div class="lh-title">FULL-STACK WEB DEVELOPER</div>
      <div class="lh-tagline">3+ Years · Production Systems</div>
    </div>
    <div class="lh-right">
      <!-- Contact details -->
    </div>
  </div>
  <!-- END_CV_LETTERHEAD -->

  <div class="cv-layout">

    <!-- ── LEFT COLUMN ── -->
    <div class="left-col">

      <!-- Summary -->
      <div class="sec-label">SUMMARY</div>
      <hr class="sec-rule">
      <!-- START_CV_SUMMARY -->
      <p class="summary-text">
        Full-Stack Web Developer with 3+ years of production experience building enterprise applications
        across Vue/Nuxt, React/Next.js, and Angular — with NestJS, Laravel, and Spring Boot on the back end.
        Delivered nationwide rental marketplaces, enterprise POS, banking, and loan platforms.
        Specialised in Cloudflare edge infrastructure, Firebase real-time systems, and
        Cambodia-native Bakong KHQR payment integration.
      </p>
      <!-- END_CV_SUMMARY -->

      <!-- Experience -->
      <div class="sec-label" style="margin-top:14px;">Professional Experience</div>
      <hr class="sec-rule">
      <!-- START_P2_EXPERIENCE -->
      <!-- END_P2_EXPERIENCE -->

      <!-- Education -->
      <div class="sec-label" style="margin-top:4px;">Education</div>
      <hr class="sec-rule">
      <!-- START_P2_EDUCATION -->
      <!-- END_P2_EDUCATION -->

      <!-- References -->
      <div class="sec-label" style="margin-top:4px;">Personal References</div>
      <hr class="sec-rule">
      <!-- START_P2_REFERENCES -->
      <!-- END_P2_REFERENCES -->

    </div><!-- /left col -->

    <!-- ── RIGHT COLUMN ── -->
    <div class="right-col">



      <!-- Professional Skills -->
      <div class="sec-label" style="margin-top:12px;">Professional Skills</div>
      <hr class="sec-rule">
      <!-- START_P2_SKILLS -->
      <!-- END_P2_SKILLS -->

      <!-- Personal Skills -->
      <div class="sec-label" style="margin-top:12px;">Personal Skills</div>
      <hr class="sec-rule">
      <ul class="personal-list">
        <li>Problem Solving</li>
        <li>Team Collaboration</li>
        <li>Continuous Learning</li>
        <li>Time Management</li>
        <li>Detail-Oriented</li>
        <li>Effective Communication</li>
      </ul>

      <!-- Languages -->
      <div class="sec-label" style="margin-top:12px;">Languages</div>
      <hr class="sec-rule">
      <!-- START_P2_LANGUAGE -->
      <!-- END_P2_LANGUAGE -->

    </div><!-- /right col -->

  </div><!-- /cv-layout -->

</div><!-- /cv page -->

</body>
</html>
`;
