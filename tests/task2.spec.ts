import { test, expect, chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const baseURL = 'https://university.engenious.io/';
const validEmail = process.env.TEST_EMAIL || '';
const validPassword = process.env.TEST_PASSWORD || '';
const invalidPassword = 'WrongPassword123';
const invalidEmail = 'nonexistent@example.com';

test.describe('Login Tests on Engenious University', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.getByRole('button', { name: 'Sign Up / Login' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC01 - Successful Login with Valid Credentials', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(validEmail);
    await page.getByPlaceholder('Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Dashboard')).toBeVisible(); 
  });

  test('TC02 - Login with Invalid Password', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(validEmail);
    await page.getByPlaceholder('Password').fill(invalidPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid credentials!')).toBeVisible();
  });

  test('TC03 - Login with Invalid Email', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(invalidEmail);
    await page.getByPlaceholder('Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your password should have minimum eight characters, at least one uppercase letter, one lowercase letter and one digit')).toBeVisible();
  });

  test('TC04 - Login with Blank Fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('TC05 - Login with Only Email Filled', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(validEmail);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('TC06 - Password Field is Masked', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC07 - Account lockout after 5 attempts', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.getByPlaceholder('Email').fill(validEmail);
      await page.getByPlaceholder('Password').fill(invalidPassword);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForTimeout(1000); 
    }
    await expect(
      page.getByText('Too many failed attempts')
    ).toBeVisible();
  });

  test('TC08 - HTTPS Security Check', async ({ page }) => {
    expect(page.url().startsWith('https://')).toBeTruthy();
  });

});
