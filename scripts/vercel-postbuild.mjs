// Vercel cannot run PHP. Remove the PHP form handler and Apache files from the Vercel output,
// so they are never served as plain text. On Vercel the form uses api/lead.ts instead.
import { rmSync } from 'node:fs';
for (const p of ['dist/api/lead.php', 'dist/api/lib', 'dist/api/private', 'dist/api/.htaccess', 'dist/.htaccess']) {
  rmSync(p, { recursive: true, force: true });
}
console.log('Removed PHP and .htaccess files from the Vercel build output.');
