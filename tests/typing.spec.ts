import { test, expect } from '@playwright/test';
import { Login } from './login'; 

test.describe('Validate Typing', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

    test('Happy Path', async({ page }) => {
    });
});
