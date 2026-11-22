import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Ensure public/README.md exists if README.md exists
if (fs.existsSync('README.md')) {
  fs.mkdirSync('public', { recursive: true });
  fs.copyFileSync('README.md', 'public/README.md');
}

// Detect if we are already inside a Vercel/next-on-pages child build invocation
const isVercelOrChildBuild = Boolean(
  process.env.VERCEL ||
  process.env.NOW_BUILDER ||
  process.env.__NEXT_ON_PAGES_CHILD
);

// If running in Cloudflare Pages environment, invoke next-on-pages (unless already inside the child build)
if ((process.env.CF_PAGES === '1' || process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_URL) && !isVercelOrChildBuild) {
  console.log('⚡ Cloudflare Pages detected (CF_PAGES=1): Building with next-on-pages to .vercel/output/static...');
  execSync('next-on-pages', {
    stdio: 'inherit',
    env: {
      ...process.env,
      __NEXT_ON_PAGES_CHILD: '1',
    },
  });
} else {
  console.log('⚡ Building with Next.js...');
  execSync('next build', { stdio: 'inherit' });
}
