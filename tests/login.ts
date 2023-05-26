import { Page } from '@playwright/test';

import { Email, Password, Host } from './config';

const Login = async(page: Page) => {
    const URL = `${Host}/Home/Login`;
    await page.goto(URL);
    await page.getByLabel('Email').fill(Email);
    await page.getByLabel('Password').fill(Password);
    await page.getByRole('button').click();
};

export { Login };