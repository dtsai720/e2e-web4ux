import { Page } from "@playwright/test";

import { Attribute } from "./http";

const csrfSelector = 'input[name="__RequestVerificationToken"]';

const Token = async (page: Page): Promise<string> => {
    const token = await page.locator(csrfSelector);
    return (await token.getAttribute(Attribute.Value)) || "";
};

export { Token };
