#!/usr/bin/env node

/**
 * Secret Scanner — Scans the repo for accidentally committed secrets.
 * Run before every commit and before making the repo public.
 * Usage: node scripts/scan-secrets.mjs
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';

const PATTERNS = [
  { name: 'PayPal Client Secret', regex: /(?:PAYPAL_CLIENT_SECRET|paypal.*secret)\s*[=:]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi },
  { name: 'API Key', regex: /(?:API_KEY|api_key|apikey)\s*[=:]\s*['"]?[A-Za-z0-9_-]{20,}['"]?/gi },
  { name: 'Bearer Token', regex: /Bearer\s+[A-Za-z0-9_-]{20,}/g },
  { name: 'Private Key', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
  { name: 'Generic Secret Assignment', regex: /(?:secret|password|token|credential)\s*[=:]\s*['"][^'"]{8,}['"]/gi },
  { name: 'Hardcoded PayPal Sandbox Secret', regex: /E[A-Za-z0-9]{50,}/g }, // PayPal secrets often start with E
];

const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.wrangler', 'coverage', '.pnpm-store'];
const IGNORE_FILES = ['.env', '.env.local', '.env.example', 'scan-secrets.mjs', 'package-lock.json', 'pnpm-lock.yaml'];
const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml', '.toml', '.env', '.sh', '.ps1'];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (!IGNORE_FILES.includes(entry.name)) {
      const ext = extname(entry.name);
      if (ALLOWED_EXTENSIONS.includes(ext) || entry.name.startsWith('.env')) {
        yield fullPath;
      }
    }
  }
}

async function scan() {
  const root = process.cwd();
  let found = 0;

  console.log('🔍 Scanning for secrets...\n');

  for await (const file of walk(root)) {
    try {
      const content = await readFile(file, 'utf-8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        for (const pattern of PATTERNS) {
          const matches = lines[i].match(pattern.regex);
          if (matches) {
            // Skip obvious false positives
            const line = lines[i].trim();
            if (line.startsWith('//') || line.startsWith('#') || line.startsWith('*')) continue;
            if (line.includes('process.env') || line.includes('Deno.env')) continue;
            if (line.includes('example') || line.includes('placeholder') || line.includes('your-') || line.includes('your_')) continue;
            if (file.includes('__tests__') || file.includes('.test.')) continue;
            
            const relativePath = file.replace(root + '\\', '').replace(root + '/', '');
            console.log(`⚠️  ${pattern.name} found in ${relativePath}:${i + 1}`);
            console.log(`   ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}\n`);
            found++;
          }
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  if (found === 0) {
    console.log('✅ No secrets found. Safe to publish.\n');
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${found} potential secret(s). Review and remove before publishing.\n`);
    process.exit(1);
  }
}

scan().catch(console.error);
