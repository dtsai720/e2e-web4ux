import { Page } from "@playwright/test";

import { Email, Password, URL } from "./config";

const Login = async (page: Page) => {
    await page.goto(URL.Login);
    await page.getByLabel("Email").fill(Email);
    await page.getByLabel("Password").fill(Password);
    await page.getByRole("button").click();
};

export { Login };
