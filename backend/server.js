import app from './app.js';
import { testConnection } from './config/db.js';
import env from './config/env.js';
import { mailEnabled } from './services/mailer.js';

const start = async () => {
  try {
    await testConnection();
    console.log(`✔ MySQL connected (${env.db.host}:${env.db.port}/${env.db.database})`);
  } catch (err) {
    console.error('✖ Could not connect to MySQL:', err.code || err.message);
    console.error('  → Start MySQL in the XAMPP Control Panel, check backend/.env, then run: npm run db:init');
    process.exit(1);
  }
  app.listen(env.port, () => {
    console.log(`✔ API listening on http://localhost:${env.port}/api  (${env.nodeEnv})`);
    console.log(`  Email: ${mailEnabled() ? 'SMTP enabled' : 'SMTP not configured (emails are only logged)'}  |  Captcha: ${env.turnstileSecret ? 'on' : 'off'}`);
  });
};

start();
