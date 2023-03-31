import { test } from '@playwright/test';
import { Login } from './login';

test.describe('Validate Drag And Drop', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

    test('Happy Path', async({ page }) => {
        // const URL = await page.url();
        // expect(URL).toEqual('hello world')
    });
});