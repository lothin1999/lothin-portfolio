import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Ensure public/README.md exists if README.md exists
if (fs.existsSync('README.md')) {
  fs.mkdirSync('public', { recursive: true });
  fs.copyFileSync('README.md', 'public/README.md');
}

// If running in Cloudflare Pages environment, invoke next-on-pages
if (process.env.CF_PAGES === '1' || process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_URL) {
  console.log('⚡ Cloudflare Pages detected (CF_PAGES=1): Building with next-on-pages to .vercel/output/static...');
  execSync('next-on-pages', { stdio: 'inherit' });
} else {
  console.log('⚡ Local environment: Building with Next.js...');
  execSync('next build', { stdio: 'inherit' });
}
