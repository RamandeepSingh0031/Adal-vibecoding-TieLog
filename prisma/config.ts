import path from 'node:path';
import { config as dotenvConfig } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env.local explicitly
dotenvConfig({ path: path.join(__dirname, '..', '.env.local') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    url: process.env.DIRECT_URL!,
  },
});