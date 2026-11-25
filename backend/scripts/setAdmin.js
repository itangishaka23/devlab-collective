// Updates (or creates) the admin account using ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env
//   1. edit backend/.env
//   2. npm run admin:set
// Keeps all your data. The old admin login stops working immediately.
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import env from '../config/env.js';

const { name, email, password } = env.admin;

if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  console.error('✖ ADMIN_PASSWORD must be at least 8 characters and contain a letter and a number.');
  process.exit(1);
}
if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error('✖ ADMIN_EMAIL is not a valid email address.');
  process.exit(1);
}

const db = await mysql.createConnection({ ...env.db, charset: 'utf8mb4' }).catch((err) => {
  console.error('✖ Could not connect to MySQL:', err.code || err.message);
  console.error('  → Start MySQL in the XAMPP Control Panel and check DB_* values in backend/.env');
  process.exit(1);
});

try {
  const hash = await bcrypt.hash(password, 12);
  const [admins] = await db.query("SELECT id, email FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1");

  // The new email must not belong to a different account
  const [clash] = await db.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, admins[0]?.id ?? 0]);
  if (clash.length) {
    console.error(`✖ ${email} is already used by another account. Pick a different ADMIN_EMAIL.`);
    process.exitCode = 1;
  } else if (admins.length) {
    await db.query('UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?', [name, email, hash, admins[0].id]);
    console.log(`✔ Admin updated: ${admins[0].email}  →  ${email}  (password changed)`);
  } else {
    await db.query("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')", [name, email, hash]);
    console.log(`✔ Admin created: ${email}`);
  }
} catch (err) {
  console.error('✖ Failed:', err.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
