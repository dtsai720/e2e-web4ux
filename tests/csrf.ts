import { Page } from '@playwright/test';

const Token = async( page: Page ): Promise<string> => {
    const token = await page.locator('input[name=__RequestVerificationToken]');
    return await token.getAttribute('value') || '';
};

export { Token };