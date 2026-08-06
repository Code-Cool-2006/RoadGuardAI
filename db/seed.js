import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from './pool.js';

async function seed() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log('Super admin already exists, skipping.');
    return pool.end();
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, 'super_admin', NULL)`,
    ['Super Admin', email, passwordHash]
  );

  console.log(`✔ Created super_admin: ${email}`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
