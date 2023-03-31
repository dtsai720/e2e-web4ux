import { test, expect, Page } from '@playwright/test';
import { Email, Password, Host } from './config';

test.describe('Validate Login', () => {
    const URL = `${Host}/Home/Login`;
    const redirectURL = async(page: Page, email: string, password: string): Promise<string> => {
        await page.goto(URL);
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: 'Login' }).click();
        return await page.url();
    };

    test('Happy Path', async ({ page }) => {
        const currentURL = await redirectURL(page, Email, Password);
        expect(currentURL).toEqual(`${Host}/Project`);
    });

    test('Failure: Empty Email', async ({ page }) => {
        const currentURL = await redirectURL(page, '', Password);
        expect(currentURL).toEqual(URL);
    });

    test('Failure: Empty Password', async ({ page }) => {
        const currentURL = await redirectURL(page, Email, '');
        expect(currentURL).toEqual(URL);
    });
});
