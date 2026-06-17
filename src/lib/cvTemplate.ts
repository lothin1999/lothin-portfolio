export const cvTemplate = `<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thoeun Lothin — CV</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #18140f;
    --ink2: #3a3228;
    --muted: #7a6e62;
    --accent: #6b4f2a;
    --accent-light: #c4a882;
    --cream: #faf7f2;
    --paper: #ffffff;
    --rule: #e2d9cc;
    --tag-bg: #f2ede5;
    --tag-text: #5a4530;
    --sidebar-bg: #1c1713;
    --sidebar-text: #e8dece;
    --sidebar-muted: #9a8a78;
    --sidebar-accent: #c4a882;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Outfit', sans-serif;
    background: #e8e0d5;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 16px;
    gap: 48px;
  }

  .page {
    width: 794px;
    min-height: 1123px;
    background: var(--paper);
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: auto 1fr;
    align-items: stretch;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
  }

  /* ── HEADER ───────────────────────────────── */
  .header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 240px 1fr auto;
    align-items: stretch;
    border-bottom: 1px solid var(--rule);
  }

  .header-accent {
    background: var(--sidebar-bg);
    padding: 38px 28px 32px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .header-accent .label {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--sidebar-muted);
    margin-bottom: 8px;
    font-weight: 500;
  }
  .name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 300;
    color: #fff;
    line-height: 1.05;
    letter-spacing: 0.5px;
  }
  .name em {
    font-style: italic;
    color: var(--sidebar-accent);
  }

  .header-main {
    padding: 32px 32px 28px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    border-left: 1px solid var(--rule);
  }
  .title-line {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .title-line::before {
    content: '';
    width: 32px;
    height: 1px;
    background: var(--accent);
    flex-shrink: 0;
  }
  .job-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3.5px;
    text-transform: uppercase;
    color: var(--accent);
  }
  .header-summary {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.7;
    max-width: 380px;
    font-weight: 300;
  }

  .header-photo {
    width: 160px;
    background: var(--cream);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    border-left: 1px solid var(--rule);
    padding: 0 0 0 0;
    overflow: hidden;
    position: relative;
  }
  .photo-initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(160deg, #e8dece 0%, #d4c4a8 100%);
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px;
    font-weight: 300;
    color: var(--accent);
    letter-spacing: -2px;
    font-style: italic;
  }

  /* ── SIDEBAR ──────────────────────────────── */
  .sidebar {
    background: var(--sidebar-bg);
    padding: 36px 28px 48px;
    color: var(--sidebar-text);
    align-self: stretch;
  }

  .sidebar .section { margin-bottom: 32px; }

  .sidebar .section-title {
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--sidebar-muted);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #2e2820;
  }

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
  .contact-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--sidebar-accent);
  }
  .contact-text {
    font-size: 11.5px;
    color: var(--sidebar-text);
    line-height: 1.4;
    font-weight: 300;
  }
  .contact-text a { color: var(--sidebar-accent); text-decoration: none; }

  /* Skills sidebar */
  .skill-block { margin-bottom: 18px; }
  .skill-block-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--sidebar-accent);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 7px;
  }
  .skill-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .skill-pill {
    font-size: 10px;
    padding: 3px 8px;
    border: 1px solid #2e2820;
    color: #b0a090;
    font-weight: 400;
    letter-spacing: 0.3px;
    border-radius: 1px;
  }
  .skill-pill.hi {
    border-color: var(--sidebar-accent);
    color: var(--sidebar-accent);
  }

  /* Languages sidebar */
  .lang-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .lang-name {
    font-size: 11.5px;
    font-weight: 400;
    color: var(--sidebar-text);
  }
  .lang-level {
    font-size: 10px;
    color: var(--sidebar-muted);
  }
  .lang-bar-track {
    height: 2px;
    background: #2e2820;
    border-radius: 1px;
    margin-top: 5px;
    position: relative;
  }
  .lang-bar-fill {
    position: absolute;
    left: 0; top: 0; height: 100%;
    background: var(--sidebar-accent);
    border-radius: 1px;
  }

  /* ── MAIN CONTENT ─────────────────────────── */
  .main {
    padding: 36px 40px 48px 36px;
    border-left: 1px solid var(--rule);
  }

  .main .section { margin-bottom: 30px; }

  .main .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
    color: var(--ink);
    margin-bottom: 18px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .main .section-title::after {
    content: '';
    display: inline-block;
    width: 5px;
    height: 5px;
    background: var(--accent);
    border-radius: 50%;
    margin-left: auto;
    flex-shrink: 0;
  }

  /* Experience */
  .exp-item {
    margin-bottom: 22px;
    padding-bottom: 22px;
    border-bottom: 1px dashed var(--rule);
    page-break-inside: avoid;
  }
  .exp-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

  .exp-meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2px;
    gap: 12px;
  }
  .exp-role {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: 0.1px;
  }
  .exp-date {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1.5px;
    color: var(--accent);
    text-transform: uppercase;
    white-space: nowrap;
    padding: 3px 8px;
    border: 1px solid var(--accent-light);
    background: #fdf8f2;
    border-radius: 1px;
    flex-shrink: 0;
  }
  .exp-company {
    font-size: 11.5px;
    color: var(--muted);
    margin-bottom: 8px;
    font-weight: 300;
  }
  .exp-bullets {
    list-style: none;
    padding: 0;
  }
  .exp-bullets li {
    font-size: 11.5px;
    color: #4a4038;
    line-height: 1.6;
    padding-left: 14px;
    position: relative;
    margin-bottom: 4px;
    font-weight: 300;
  }
  .exp-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 5px;
    height: 1px;
    background: var(--accent-light);
  }

  /* Education */
  .edu-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
  }
  .edu-year {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 300;
    color: var(--accent-light);
    line-height: 1;
    flex-shrink: 0;
    width: 48px;
    text-align: right;
    padding-top: 1px;
  }
  .edu-info {}
  .edu-degree {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ink);
  }
  .edu-school {
    font-size: 11.5px;
    color: var(--muted);
    font-weight: 300;
  }

  /* References */
  .ref-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .ref-card {
    border: 1px solid var(--rule);
    padding: 14px 16px;
    border-radius: 2px;
    background: var(--cream);
    page-break-inside: avoid;
  }
  .ref-name {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 2px;
  }
  .ref-role {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 6px;
    font-weight: 500;
  }
  .ref-link {
    font-size: 11px;
    color: var(--muted);
    text-decoration: none;
    display: block;
    line-height: 1.6;
  }
  .ref-link:hover { color: var(--accent); }

  @page {
    size: A4;
    margin: 0;
  }
  @media print {
    body { background: #fff; padding: 0; margin: 0; gap: 0; }
    .page { box-shadow: none; width: 210mm; min-height: 297mm; }
  }
</style>

</head>
<body>

<div class="page" style="page-break-after:always; width:794px; min-height:1123px; display:flex; flex-direction:column; background:#fff; box-shadow:0 20px 60px rgba(0,0,0,0.18);">

  <!-- LETTERHEAD -->
  <div style="background:#1c1713; padding:36px 48px; display:flex; justify-content:space-between; align-items:flex-end; flex-shrink:0;">
    <div>
      <div style="font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:8px; font-weight:500;">Cover Letter</div>
      <div style="font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:300; color:#fff; line-height:1.05; letter-spacing:0.5px;">Thoeun <em style="font-style:italic; color:#c4a882;">Lothin</em></div>
      <div style="margin-top:8px; font-size:10px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#c4a882;">Full-Stack Developer</div>
    </div>
    <!-- START_CL_CONTACT -->
<div style="font-size:11px; color:#9a8a78; line-height:1.9; font-weight:300; text-align:right;">
      <div style="color:#e8dece;">098 63 88 78 &nbsp;/&nbsp; 066 69 55 37</div>
      <div><a href="https://lothin-portfolio.pages.dev" style="color:#c4a882; text-decoration:none;">lothin-portfolio.pages.dev</a></div>
      <div><a href="https://t.me/lothindev" style="color:#c4a882; text-decoration:none;">t.me/lothindev</a></div>
      <div><a href="https://linkedin.com/in/lothin-dev" style="color:#c4a882; text-decoration:none;">linkedin.com/in/lothin-dev</a></div>
      <div style="margin-top:4px;">Phnom Penh, Cambodia &nbsp;·&nbsp; June 2026</div>
    </div>
<!-- END_CL_CONTACT -->
  </div>

  <!-- ACCENT LINE -->
  <div style="height:3px; background:linear-gradient(90deg,#6b4f2a 0%,#c4a882 60%,#e2d9cc 100%); flex-shrink:0;"></div>

  <!-- TWO COLUMN BODY -->
  <div style="display:grid; grid-template-columns:240px 1fr; flex:1;">

    <!-- Left sidebar -->
    <div style="background:#1c1713; padding:36px 28px 48px;">

      <!-- START_CL_DATE -->
<div style="font-size:8.5px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #2e2820;">Date</div>
      <div style="font-size:11.5px; color:#e8dece; font-weight:300; margin-bottom:28px; line-height:1.8;">June 2026<br>Phnom Penh, Cambodia</div>
<!-- END_CL_DATE -->

      <!-- START_CL_KEY_SKILLS -->
<div style="font-size:8.5px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #2e2820;">Key Skills</div>
      <div style="font-size:11.5px; color:#b0a090; line-height:2.1; font-weight:300; margin-bottom:28px;">
        Vue.js / Nuxt 2·3·4<br>
        React.js / Next.js<br>
        Angular / TypeScript<br>
        NestJS / Laravel<br>
        Spring Boot<br>
        Docker / Cloudflare<br>
        Firebase / Firestore<br>
        Bakong KHQR<br>
        Google AI Studio
      </div>
<!-- END_CL_KEY_SKILLS -->

      <!-- START_CL_REFERENCES -->
<div style="font-size:8.5px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:#9a8a78; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #2e2820;">References</div>
      <div style="font-size:11.5px; color:#e8dece; font-weight:300; line-height:1.8;">
        <div style="color:#c4a882; font-weight:500; margin-top:4px;">Pheap Sopheaktra</div>
        <div style="color:#9a8a78; font-size:10.5px;">Full-Stack Dev · IDG</div>
        <div style="color:#9a8a78; font-size:10.5px; margin-bottom:14px;">096 92 84 202</div>
        <div style="color:#c4a882; font-weight:500;">Sopheak HUN</div>
        <div style="color:#9a8a78; font-size:10.5px;">Backend Developer</div>
        <div style="color:#9a8a78; font-size:10.5px;">TurboTech Co., LTD</div>
        <div style="color:#9a8a78; font-size:10.5px;">+855 93 259 390</div>
      </div>
<!-- END_CL_REFERENCES -->
    </div>

    <!-- Right letter body -->
    <div style="padding:44px 48px 48px; background:#fff; border-left:1px solid #e2d9cc;">

      <p style="font-size:13px; color:#3a3228; line-height:1.85; margin-bottom:22px;">Dear Hiring Manager,</p>

      <p style="font-size:13px; color:#3a3228; line-height:1.9; margin-bottom:18px;">
        I am writing to express my interest in a <strong style="font-weight:500;">Full-Stack Developer</strong> position. With more than three years of professional experience, I have designed and developed enterprise applications, nationwide rental marketplaces, POS systems, banking platforms, CRM solutions, and document management systems.
      </p>

      <p style="font-size:13px; color:#3a3228; line-height:1.9; margin-bottom:18px;">
        My core technical expertise spans <strong style="font-weight:500;">Vue.js / Nuxt</strong>, <strong style="font-weight:500;">React.js / Next.js</strong>, <strong style="font-weight:500;">Angular</strong>, <strong style="font-weight:500;">NestJS</strong>, <strong style="font-weight:500;">Laravel</strong>, <strong style="font-weight:500;">Spring Boot</strong>, <strong style="font-weight:500;">Docker</strong>, <strong style="font-weight:500;">Cloudflare</strong>, <strong style="font-weight:500;">Firebase</strong>, <strong style="font-weight:500;">Google AI Studio (Gemini)</strong>, and <strong style="font-weight:500;">Bakong KHQR</strong> integration.
      </p>

      <p style="font-size:13px; color:#3a3228; line-height:1.9; margin-bottom:18px;">
        I have led major system migrations — including full Nuxt 2 → 3 → 4 and Laravel → NestJS upgrades — designed scalable monorepo architectures, optimized database performance, and deployed production systems on Linux servers and cloud infrastructure. I have also applied <strong style="font-weight:500;">AI model training and data analysis</strong> using Google AI Studio to drive intelligent feature development.
      </p>

      <p style="font-size:13px; color:#3a3228; line-height:1.9; margin-bottom:32px;">
        I am passionate about building high-quality software, learning new technologies, and collaborating with teams to deliver real business value through technology. I welcome the opportunity to discuss how my experience can contribute to your organization.
      </p>

      <p style="font-size:13px; color:#7a6e62; line-height:1.8; margin-bottom:40px;">Thank you for your time and consideration.</p>

      <!-- START_CL_SIGNATURE -->
<!-- Signature -->
      <div style="border-top:1px solid #e2d9cc; padding-top:28px;">
        <div style="font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; font-style:italic; color:#6b4f2a; letter-spacing:0.5px; margin-bottom:5px;">Thoeun Lothin</div>
        <div style="font-size:10px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; color:#7a6e62;">Full-Stack Developer</div>
        <div style="font-size:11px; color:#7a6e62; margin-top:3px; font-weight:300;">Phnom Penh, Cambodia</div>
      </div>
<!-- END_CL_SIGNATURE -->

    </div>
  </div>

</div>

<div class="page">

  <!-- START_P2_HEADER -->
<!-- HEADER -->
  <div class="header">
    <div class="header-accent">
      <div class="label">Full-Stack Developer</div>
      <div class="name"><em>Thoeun</em><br>Lothin</div>
    </div>
    <div class="header-main">
      <div class="title-line">
        <span class="job-title">3+ Years · Production Systems</span>
      </div>
      <p class="header-summary">
        Full-stack developer across Vue/Nuxt, React/Next.js, and Angular — with NestJS, Laravel, and Spring Boot on the back end. Delivered nationwide rental marketplaces, enterprise POS, banking, and loan platforms. Specialised in Cloudflare edge infrastructure, Firebase real-time systems, and Cambodia-native Bakong KHQR payment integration.
      </p>
    </div>
<!-- END_P2_HEADER -->
    <!-- START_P2_PHOTO -->
<div class="header-photo">
      <img src="__DEFAULT_PHOTO_BASE64__" style="width:100%;height:100%;object-fit:cover;object-position:center top;">
    </div>
<!-- END_P2_PHOTO -->
  </div>

  <!-- SIDEBAR -->
  <div class="sidebar">

    <!-- START_P2_CONTACT -->
<div class="section">
      <div class="section-title">Contact</div>
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="contact-text">Phnom Penh, Cambodia</span>
      </div>
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
        <span class="contact-text"><a href="https://lothin-portfolio.pages.dev">lothin-portfolio.pages.dev</a></span>
      </div>
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.5 4.5L2.5 10.5l7 2.5m12-8.5l-5 15-5-7.5m10-7.5l-12 8"/></svg>
        <span class="contact-text"><a href="https://t.me/lothindev">lothindev (Telegram)</a></span>
      </div>
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        <span class="contact-text">098 63 88 78 &nbsp;/&nbsp; 066 69 55 37</span>
      </div>
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        <span class="contact-text"><a href="https://linkedin.com/in/lothin-dev">linkedin.com/in/lothin-dev</a></span>
      </div>
    </div>
<!-- END_P2_CONTACT -->

    <!-- START_P2_SKILLS -->
<div class="section">
      <div class="section-title">Skills</div>
      <div class="skill-block">
        <div class="skill-block-label">Front-End</div>
        <div class="skill-list">
          <span class="skill-pill hi">Vue 3</span>
          <span class="skill-pill hi">Nuxt 2/3/4</span>
          <span class="skill-pill hi">React.js</span>
          <span class="skill-pill hi">Next.js</span>
          <span class="skill-pill hi">Angular</span>
          <span class="skill-pill hi">TypeScript</span>
          <span class="skill-pill">Tailwind CSS</span>
          <span class="skill-pill">Pinia / Redux</span>
          <span class="skill-pill">RxJS</span>
        </div>
      </div>
      <div class="skill-block">
        <div class="skill-block-label">Back-End</div>
        <div class="skill-list">
          <span class="skill-pill hi">NestJS</span>
          <span class="skill-pill hi">Laravel</span>
          <span class="skill-pill hi">Spring Boot</span>
          <span class="skill-pill">Prisma ORM</span>
          <span class="skill-pill">JWT / OAuth2</span>
          <span class="skill-pill">REST API</span>
        </div>
      </div>
      <div class="skill-block">
        <div class="skill-block-label">Databases</div>
        <div class="skill-list">
          <span class="skill-pill">MySQL</span>
          <span class="skill-pill">PostgreSQL</span>
          <span class="skill-pill">Oracle</span>
          <span class="skill-pill">MongoDB</span>
          <span class="skill-pill">Firestore</span>
        </div>
      </div>
      <div class="skill-block">
        <div class="skill-block-label">DevOps &amp; Cloud</div>
        <div class="skill-list">
          <span class="skill-pill hi">Docker</span>
          <span class="skill-pill hi">Cloudflare</span>
          <span class="skill-pill hi">Firebase</span>
          <span class="skill-pill">Ubuntu Server</span>
          <span class="skill-pill">Nginx</span>
          <span class="skill-pill">GitHub</span>
          <span class="skill-pill">GitLab</span>
        </div>
      </div>
      <div class="skill-block">
        <div class="skill-block-label">Integrations</div>
        <div class="skill-list">
          <span class="skill-pill hi">Bakong KHQR</span>
          <span class="skill-pill">Pusher</span>
          <span class="skill-pill">WebSockets</span>
          <span class="skill-pill">FCM</span>
          <span class="skill-pill">SSR / ISR</span>
          <span class="skill-pill hi">Google AI Studio (Gemini)</span>
          <span class="skill-pill hi">AI Model Training</span>
          <span class="skill-pill">Data Analysis / ML</span>
        </div>
      </div>
    </div>
<!-- END_P2_SKILLS -->

    <!-- START_P2_LANGUAGE -->
<div class="section" style="page-break-before: always; padding-top: 36px;">
      <div class="section-title">Language</div>
      <div>
        <div class="lang-row">
          <span class="lang-name">Khmer</span>
          <span class="lang-level">Native</span>
        </div>
        <div class="lang-bar-track"><div class="lang-bar-fill" style="width:100%"></div></div>
      </div>
      <div style="margin-top:12px">
        <div class="lang-row">
          <span class="lang-name">English</span>
          <span class="lang-level">Professional</span>
        </div>
        <div class="lang-bar-track"><div class="lang-bar-fill" style="width:80%"></div></div>
      </div>
    </div>
<!-- END_P2_LANGUAGE -->

  </div>

  <!-- MAIN -->
  <div class="main">

    <!-- START_P2_EXPERIENCE -->
<div class="section">
      <div class="section-title">Experience</div>

      <div class="exp-item">
        <div class="exp-meta">
          <div class="exp-role">Full-Stack Developer</div>
          <div class="exp-date">2025 – Present</div>
        </div>
        <div class="exp-company">IDG Technology Solutions &nbsp;·&nbsp; Phnom Penh, Cambodia</div>
        <ul class="exp-bullets">
          <li>Built nationwide motorbike rental marketplace with Nuxt 4 SSR and province-based filtering across 25+ Cambodian provinces</li>
          <li>Developed complete booking engine — availability calendar, pricing engine, and special deals module</li>
          <li>Integrated multi-language Khmer/English support with mobile-first responsive UI</li>
          <li>Implemented merchant review &amp; rating system with verified badges and star ratings</li>
          <li>Used Google AI Studio (Gemini) to train and fine-tune AI models, analyze datasets, and integrate intelligent features — including smart search, data classification, and automated content insights</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="exp-meta">
          <div class="exp-role">Full-Stack Developer</div>
          <div class="exp-date">2024 – Present</div>
        </div>
        <div class="exp-company">IDG Technology Solutions &nbsp;·&nbsp; Phnom Penh, Cambodia</div>
        <ul class="exp-bullets">
          <li>Built POS system in Nuxt 2 with 8-metric admin dashboard, revenue charts, and Khmer-language UI</li>
          <li>Led full Nuxt 2 → 3 → 4 migration, resolving breaking changes and adopting Composition API</li>
          <li>Replaced Laravel backend with modular NestJS + Prisma monorepo with JWT auth and DTO validation</li>
          <li>Developed enterprise Banking Platform with real-time transaction processing and multi-branch support</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="exp-meta">
          <div class="exp-role">Full-Stack Developer</div>
          <div class="exp-date">2023 – 2024</div>
        </div>
        <div class="exp-company">IDG Technology Solutions &nbsp;·&nbsp; Phnom Penh, Cambodia</div>
        <ul class="exp-bullets">
          <li>Delivered CRM, Hotel Management, KDMS, Loan, Pool/Billiard, and VIP systems end-to-end</li>
          <li>Built real-time pool hall management with Pusher — table booking, session billing, live status board</li>
          <li>Integrated Firebase and Pusher for live notifications across multiple projects</li>
          <li>Managed cPanel hosting, DB migrations, and Ubuntu Server production deployments</li>
        </ul>
      </div>
    </div>
<!-- END_P2_EXPERIENCE -->

    <!-- START_P2_EDUCATION -->
<div class="section" style="page-break-before: always; padding-top: 36px;">
      <div class="section-title">Education</div>
      <div class="edu-row">
        <div class="edu-year">'19–'23</div>
        <div class="edu-info">
          <div class="edu-degree">Bachelor's Degree — Information Technology</div>
          <div class="edu-school">Setec Institute &nbsp;·&nbsp; Phnom Penh, Cambodia</div>
          <div style="font-size:11px;color:#9a8a78;margin-top:6px;font-weight:300;line-height:1.7;">4-year program with core focus on Management Information System, networking, and database systems.</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">C++ / C# Programming</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Java Programming I–III</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Web Development I–III</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Web Based Development I–II</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Python / Adv Python</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Data Structure I–II</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Database Design &amp; Oracle I–II</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Mobile Application I–II</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">System Analysis I–II</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Networking I–III</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Linux System Admin I–II</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">UX/UI Design</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">E-Commerce</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Ethics &amp; Law of IT</span>
          </div>
        </div>
      </div>

      <div class="edu-row">
        <div class="edu-year"></div>
        <div class="edu-info">
          <div class="edu-degree">Full-Stack Development &amp; Java</div>
          <div class="edu-school">Piset Java School &nbsp;·&nbsp; Phnom Penh, Cambodia</div>
          <div style="font-size:11px;color:#9a8a78;margin-top:4px;font-weight:300;line-height:1.7;">Intensive program covering Full-Stack Web Development, Java Programming, Core Spring Framework, and Spring Boot — focused on building enterprise-grade applications.</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px;">
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Full-Stack Development</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Java Programming</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Core Spring Framework</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Spring Boot</span>
            <span style="font-size:10px; background:#faf7f2; border:1px solid #e2d9cc; color:#6b4f2a; padding:3px 9px; border-radius:2px; font-weight:400;">Angular (Beginner → Advanced)</span>
          </div>
        </div>
      </div>
      <div class="edu-row">
        <div class="edu-year"></div>
        <div class="edu-info">
          <div class="edu-degree">DevOps &amp; Self Study</div>
          <div class="edu-school">Independent &nbsp;&middot;&nbsp; Ongoing</div>
          <div style="font-size:11px;color:#9a8a78;margin-top:4px;font-weight:300;">Docker, Cloudflare, Ubuntu Server, CI/CD — learned through self-study and knowledge sharing with peers</div>
        </div>
      </div>
    </div>
<!-- END_P2_EDUCATION -->

    <!-- START_P2_REFERENCES -->
<div class="section">
      <div class="section-title">References</div>
      <div class="ref-grid">
        <div class="ref-card">
          <div class="ref-name">Pheap Sopheaktra</div>
          <div class="ref-role">Full-Stack Developer &nbsp;·&nbsp; IDG Technology Solutions</div>
          <div class="ref-link">096 92 84 202</div>
        </div>
        <div class="ref-card">
          <div class="ref-name">Sopheak HUN</div>
          <div class="ref-role">Backend Developer &nbsp;·&nbsp; TurboTech Co., LTD</div>
          <div class="ref-link">+855 93 259 390</div>
        </div>
      </div>
    </div>
<!-- END_P2_REFERENCES -->

  </div>

</div>

</body>
</html>`;
