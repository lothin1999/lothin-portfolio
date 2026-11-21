import fs from 'node:fs';

try {
  fs.rmSync('.next', { recursive: true, force: true, maxRetries: 3 });
} catch (err) {
  console.warn('Warning: Could not remove .next directory:', err.message);
}

if (fs.existsSync('README.md')) {
  fs.mkdirSync('public', { recursive: true });
  fs.copyFileSync('README.md', 'public/README.md');
}
