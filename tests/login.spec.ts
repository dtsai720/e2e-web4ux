import { test, expect, Page } from "@playwright/test";

import { Account } from "../src/config";
import { URL, HTML } from "../src/http/constants";

const redirectURL = async (page: Page, email: string, password: string) => {
    await page.goto(URL.Login);
    await page.getByLabel(HTML.Label.Email).fill(email);
    await page.getByLabel(HTML.Label.Password).fill(password);
    await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Login }).click();
    return page.url();
};

test.describe("Validate Login", () => {
    test("Happy Path", async ({ page }) => {
        const currentURL = await redirectURL(page, Account.Email, Account.Password);
        expect(currentURL).toEqual(URL.Home);
    });

    test("Failure: Empty Email", async ({ page }) => {
        const currentURL = await redirectURL(page, "", Account.Password);
        expect(currentURL).toEqual(URL.Login);
    });

    test("Failure: Empty Password", async ({ page }) => {
        const currentURL = await redirectURL(page, Account.Email, "");
        expect(currentURL).toEqual(URL.Login);
    });
});
