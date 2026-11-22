import fs from 'node:fs';
import { execSync } from 'node:child_process';

try {
  if (!process.env.__NEXT_ON_PAGES_CHILD && fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true, maxRetries: 3 });
  }
} catch (err) {
  console.warn('Warning: Could not remove .next directory:', err.message);
}

if (fs.existsSync('README.md')) {
  fs.mkdirSync('public', { recursive: true });
  fs.copyFileSync('README.md', 'public/README.md');
}

const isVercelOrChildBuild = Boolean(
  process.env.VERCEL ||
  process.env.NOW_BUILDER ||
  process.env.__NEXT_ON_PAGES_CHILD
);

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
