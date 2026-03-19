import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const VISUAL_DIR = path.resolve(process.cwd(), 'e2e', 'screenshots', 'visual');

function ensureVisualDir() {
  if (!fs.existsSync(VISUAL_DIR)) {
    fs.mkdirSync(VISUAL_DIR, { recursive: true });
  }
}

function screenshotPath(name: string): string {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
  return path.join(VISUAL_DIR, `${name}_${timestamp}.png`);
}

test.describe('Login Screen', () => {
  test.beforeAll(() => {
    ensureVisualDir();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.screenshot({
      path: screenshotPath('01-login-page-loaded'),
      fullPage: true,
    });
  });

  test('should show browser validation when email is missing @ symbol', async ({
    page,
  }) => {
    const emailInput = page.getByLabel('Email input');
    await emailInput.fill('abc');

    const passwordInput = page.getByLabel('Password input');
    await passwordInput.fill('abcdefg');
    await page.screenshot({
      path: screenshotPath('02-invalid-email-filled'),
      fullPage: true,
    });

    const signInButton = page.locator(
      'button[type="submit"][aria-label="Sign In"]',
    );
    await signInButton.click();
    await page.screenshot({
      path: screenshotPath('03-browser-validation-shown'),
      fullPage: true,
    });

    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    // Chrome: "include an '@'", WebKit: "Enter an email address", Firefox: similar
    const isValidEmailError =
      validationMessage.includes("include an '@'") ||
      validationMessage.toLowerCase().includes('enter an email') ||
      validationMessage.toLowerCase().includes('email address');
    expect(isValidEmailError).toBe(true);
  });

  test('should show "Email is required" when email is empty', async ({
    page,
  }) => {
    const signInButton = page.locator(
      'button[type="submit"][aria-label="Sign In"]',
    );
    await signInButton.click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await page.screenshot({
      path: screenshotPath('04-email-required-error'),
      fullPage: true,
    });
  });

  test('should show "Password is required" when password is empty', async ({
    page,
  }) => {
    const emailInput = page.getByLabel('Email input');
    await emailInput.fill('abc@gmail.com');
    await page.screenshot({
      path: screenshotPath('05-email-filled-no-password'),
      fullPage: true,
    });

    const signInButton = page.locator(
      'button[type="submit"][aria-label="Sign In"]',
    );
    await signInButton.click();

    await expect(page.getByText('Password is required')).toBeVisible();
    await page.screenshot({
      path: screenshotPath('06-password-required-error'),
      fullPage: true,
    });
  });

  test('should show error when password is too short', async ({ page }) => {
    const emailInput = page.getByLabel('Email input');
    await emailInput.fill('abc@gmail.com');

    const passwordInput = page.getByLabel('Password input');
    await passwordInput.fill('abc');
    await page.screenshot({
      path: screenshotPath('07-short-password-filled'),
      fullPage: true,
    });

    const signInButton = page.locator(
      'button[type="submit"][aria-label="Sign In"]',
    );
    await signInButton.click();

    await expect(
      page.getByText('Password must be at least 6 characters'),
    ).toBeVisible();
    await page.screenshot({
      path: screenshotPath('08-short-password-error'),
      fullPage: true,
    });
  });

  test('should show "Invalid email or password" for wrong credentials', async ({
    page,
  }) => {
    // Mock API to return wrong-credentials error (backend may not be running)
    await page.route('**/api/v1/user/validateLogin', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid email or password' }),
        });
      } else {
        await route.continue();
      }
    });

    const emailInput = page.getByLabel('Email input');
    await emailInput.fill('abc@gmail.com');

    const passwordInput = page.getByLabel('Password input');
    await passwordInput.fill('abcdefg');
    await page.screenshot({
      path: screenshotPath('09-wrong-credentials-filled'),
      fullPage: true,
    });

    const signInButton = page.locator(
      'button[type="submit"][aria-label="Sign In"]',
    );
    await signInButton.click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await page.screenshot({
      path: screenshotPath('10-invalid-credentials-error'),
      fullPage: true,
    });
  });
});
