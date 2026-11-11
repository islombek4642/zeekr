const { execSync } = require('child_process');

function deployDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('[DB-DEPLOY] No DATABASE_URL environment variable detected. Skipping remote database setup.');
    return;
  }

  console.log('[DB-DEPLOY] DATABASE_URL detected. Synchronizing Prisma schema with remote PostgreSQL database...');
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
    console.log('[DB-DEPLOY] Schema synchronization succeeded.');
  } catch (err) {
    console.error('[DB-DEPLOY] Schema push warning (continuing build):', err.message);
  }

  console.log('[DB-DEPLOY] Seeding initial database data (models, trims, settings, admin user)...');
  try {
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    console.log('[DB-DEPLOY] Database seeding succeeded.');
  } catch (seedErr) {
    console.warn('[DB-DEPLOY] Seeding note (may already exist):', seedErr.message);
  }
}

deployDatabase();

