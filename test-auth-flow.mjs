import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const rand = Math.floor(Math.random() * 1_000_000);
const email = `testuser_${rand}@example.com`;
const mobile = String(9000000000 + (rand % 99999999)).slice(0, 10);
const password = 'password123';

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
page.on('response', (res) => {
  if (res.status() >= 400) console.log('HTTP', res.status(), res.url());
});

async function shot(name) {
  await page.screenshot({ path: `e2e-${name}.png`, fullPage: true });
  console.log(`screenshot: e2e-${name}.png`);
}

console.log(`Using email=${email} mobile=${mobile}`);

try {
// 1. Visit root, expect redirect to /login
await page.goto(BASE + '/');
await page.waitForURL('**/login');
console.log('Step 1 OK: redirected to /login ->', page.url());
await shot('01-login-redirect');

// 2. Go to /register and fill form
await page.click('text=Create one');
await page.waitForURL('**/register');
await page.fill('input[autocomplete="name"]', 'Deepu Test');
await page.fill('input[autocomplete="tel"]', mobile);
await page.fill('input[autocomplete="email"]', email);
await page.fill('input[autocomplete="new-password"] >> nth=0', password);
await page.fill('input[autocomplete="new-password"] >> nth=1', password);
await shot('02-register-filled');
await page.click('button[type="submit"]');

await page.waitForURL('**/dashboard', { timeout: 15000 });
console.log('Step 2 OK: registered & redirected to ->', page.url());
await page.waitForSelector(`text=${email}`);
await shot('03-dashboard-after-register');

// 3. Logout
await page.click('text=Log out');
await page.waitForURL('**/login', { timeout: 15000 });
console.log('Step 3 OK: logged out ->', page.url());
await shot('04-after-logout');

// 4. Log back in
await page.fill('input[autocomplete="email"]', email);
await page.fill('input[autocomplete="current-password"]', password);
await shot('05-login-filled');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 15000 });
console.log('Step 4 OK: logged back in ->', page.url());
await page.waitForSelector(`text=${email}`);
await shot('06-dashboard-after-login');

console.log('CONSOLE ERRORS:', consoleErrors.length ? consoleErrors : 'none');
} catch (err) {
  console.log('FAILURE at url:', page.url());
  console.log('Body snippet:', (await page.content()).slice(0, 2000));
  console.log('CONSOLE ERRORS SO FAR:', consoleErrors);
  await page.screenshot({ path: 'e2e-FAILURE.png', fullPage: true });
  console.error(err);
} finally {
  await browser.close();
}
