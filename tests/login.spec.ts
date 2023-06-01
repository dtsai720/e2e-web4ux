import { test, expect, Page } from "@playwright/test";

import { Email, Password } from "./config";
import { URL, Role, Label } from "./http";

const redirectURL = async (page: Page, email: string, password: string) => {
    await page.goto(URL.Login);
    await page.getByLabel(Label.Email).fill(email);
    await page.getByLabel(Label.Password).fill(password);
    await page.getByRole(Role.Button, { name: Role.Name.Login }).click();
    return await page.url();
};

test.describe("Validate Login", () => {
    test("Happy Path", async ({ page }) => {
        const currentURL = await redirectURL(page, Email, Password);
        expect(currentURL).toEqual(URL.Home);
    });

    test("Failure: Empty Email", async ({ page }) => {
        const currentURL = await redirectURL(page, "", Password);
        expect(currentURL).toEqual(URL.Login);
    });

    test("Failure: Empty Password", async ({ page }) => {
        const currentURL = await redirectURL(page, Email, "");
        expect(currentURL).toEqual(URL.Login);
    });
});
