import { Page } from "@playwright/test";

import { Account } from "./config";
import { URL, Role, Label } from "./http/http";

const Login = async (page: Page) => {
    await page.goto(URL.Login);
    await page.getByLabel(Label.Email).fill(Account.Email);
    await page.getByLabel(Label.Password).fill(Account.Password);
    await page.getByRole(Role.Button).click();
};

export { Login, Label };
