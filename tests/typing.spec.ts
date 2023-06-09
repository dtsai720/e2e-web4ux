import { test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { TypingComponents } from "../src/helper/typing";

test.skip("Typing", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    await TypingComponents(page, context);
});
