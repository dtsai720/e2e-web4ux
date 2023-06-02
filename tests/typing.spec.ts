import { test } from "@playwright/test";

import { Login } from "../src/login";

test.describe("Validate Typing", () => {
    test.beforeEach(async ({ page }) => {
        await Login(page);
    });
});
