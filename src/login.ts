import { Page } from "@playwright/test";

import { Account } from "./config";
import { URL, HTML } from "./http/constants";

const Login = async (page: Page) => {
    await page.goto(URL.Login);
    await page.getByLabel(HTML.Label.Email).fill(Account.Email);
    await page.getByLabel(HTML.Label.Password).fill(Account.Password);
    await page.getByRole(HTML.Role.Button).click();
};

export { Login };
