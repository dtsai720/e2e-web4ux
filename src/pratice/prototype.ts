import { Page } from "@playwright/test";

import { URL, HTML } from "../http/constants";

class Pratice {
    protected async prepare(page: Page, deviceId: string, account: string) {
        const url = [URL.StartPraticePrefix, deviceId].join("/");
        await page.goto(url);
        await page.getByLabel(HTML.Label.Account).fill(account);
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Starts }).click();
        await page.getByRole(HTML.Role.Link, { name: HTML.Role.Name.Start }).click();
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Start }).click();
    }
}

export { Pratice };
