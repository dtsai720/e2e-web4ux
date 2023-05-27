import { Page } from '@playwright/test';

const csrfLocator = 'input[name=__RequestVerificationToken]';

const Token = async(page: Page): Promise<string> => {
    const token = await page.locator(csrfLocator);
    return await token.getAttribute('value') || '';
};

export { Token };