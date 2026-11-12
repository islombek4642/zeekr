const { execSync } = require('child_process');

function deployDatabase() {
  // Resolve any Vercel Postgres / Prisma Postgres / Neon connection string variants
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!dbUrl) {
    console.log('[DB-DEPLOY] No database connection string detected. Skipping remote database setup.');
    return;
  }

  // Ensure DATABASE_URL is set in environment for Prisma CLI
  process.env.DATABASE_URL = dbUrl;
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING || dbUrl;
  }

  console.log('[DB-DEPLOY] Remote database URL detected. Synchronizing Prisma schema...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('[DB-DEPLOY] Schema synchronization succeeded.');
  } catch (err) {
    console.error('[DB-DEPLOY] Schema push warning (continuing build):', err.message);
  }

  console.log('[DB-DEPLOY] Seeding initial database data (models, trims, settings, admin user)...');
  try {
    execSync('npx tsx prisma/seed.ts', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('[DB-DEPLOY] Database seeding succeeded.');
  } catch (seedErr) {
    console.warn('[DB-DEPLOY] Seeding note (may already exist):', seedErr.message);
  }
}

deployDatabase();
