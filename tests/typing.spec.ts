import { test, expect } from '@playwright/test';
import { Login } from './login'; 

test.describe('Validate Typing', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

    const URL = 'https://stage-web4ux.azurewebsites.net/Login/a5b28d3314a84103b9a19596aded425c';
    test('Happy Path', async({ page }) => {
        await page.goto(URL);
        await page.locator('#Account').fill('32260');
        await page.locator('.select').click();
        await page.locator('li:has-text("a")').click();
        await page.getByRole('button').click();

        const url = await page.url();
        expect(url).toEqual('https://stage-web4ux.azurewebsites.net/Task/Preview');
    });
});
