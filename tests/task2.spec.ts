import { test, expect, chromium } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const baseURL = 'https://university.engenious.io/';
const validEmail = process.env.TEST_EMAIL || 'valid@example.com';
const validPassword = process.env.TEST_PASSWORD || 'ValidPassword123';
const invalidPassword = 'WrongPassword123';
const invalidEmail = 'nonexistent@example.com';

test.describe('Login Tests on Engenious University', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Log in' }).click();
  });

  test('TC01 - Successful Login with Valid Credentials', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(validEmail);
    await page.getByPlaceholder('Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Dashboard')).toBeVisible(); // Adjust as needed
  });

  test('TC02 - Login with Invalid Password', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(validEmail);
    await page.getByPlaceholder('Password').fill(invalidPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('TC03 - Login with Invalid Email', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(invalidEmail);
    await page.getByPlaceholder('Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('TC04 - Login with Blank Fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('TC05 - Login with Only Email Filled', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(validEmail);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('TC06 - Password Field is Masked', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('TC07 - Brute Force Lockout (5 attempts)', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByPlaceholder('Email').fill(validEmail);
      await page.getByPlaceholder('Password').fill(invalidPassword);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForTimeout(1000); // Slight delay between attempts
    }
    await expect(
      page.locator('text=Too many failed attempts')
    ).toBeVisible();
  });

  test('TC08 - HTTPS Security Check', async ({ page }) => {
    expect(page.url().startsWith('https://')).toBeTruthy();
  });

});
