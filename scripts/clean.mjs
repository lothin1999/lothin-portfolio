import fs from 'node:fs';

try {
  fs.rmSync('.next', { recursive: true, force: true, maxRetries: 3 });
  fs.rmSync('.vercel', { recursive: true, force: true, maxRetries: 3 });
} catch (err) {
  console.warn('Warning: Could not remove build directories:', err.message);
}
