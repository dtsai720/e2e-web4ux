import { Page } from "@playwright/test";

import { HTML } from "./constants";

const csrfSelector = 'input[name="__RequestVerificationToken"]';

const Token = async (page: Page) => {
    const token = page.locator(csrfSelector);
    return (await token.getAttribute(HTML.Attribute.Value)) || "";
};

export { Token };
