import { Page } from "@playwright/test";

import { Device, IPratice, Participant } from "../project/interface";
import { URL, HTML } from "../http/constants";

class Pratice implements IPratice {
    protected url: string;

    constructor(device: Device) {
        this.url = [URL.StartPraticePrefix, device.Id].join("/");
    }

    async start(page: Page, participant: Participant): Promise<any> {
        await page.goto(this.url);
        await page.getByLabel(HTML.Label.Account).fill(participant.Account);
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Starts }).click();
        await page.getByRole(HTML.Role.Link, { name: HTML.Role.Name.Start }).click();
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Start }).click();
    }
}

export { Pratice };
