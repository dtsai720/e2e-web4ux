import { test } from '@playwright/test';
import { Login } from './login'; 

test.describe('Validate Winfits', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

});