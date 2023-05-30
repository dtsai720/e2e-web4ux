import { Page } from "@playwright/test";

import { Email, Password } from "./config";
import { URL, Button, Label } from "./http";

const Login = async (page: Page) => {
    await page.goto(URL.Login);
    await page.getByLabel(Label.Email).fill(Email);
    await page.getByLabel(Label.Password).fill(Password);
    await page.getByRole(Button).click();
};

export { Login, Label };
