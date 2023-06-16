import { Page } from "@playwright/test";

import { Pratice } from "./prototype";
import { Device, Participant } from "../project/interface";
import { TypingPraticeDetails } from "./interface";
import { HTML } from "../http/constants";

const Selector = {
    Textarea: "#textarea",
    TextBox: "body > div.tping-test > div.queBox > div",
    Finish: "#btnFinish",
} as const;

class TypingPratice extends Pratice {
    private isSpace(word: string) {
        return /^\s*$/.test(word);
    }

    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        const locator = page.locator(Selector.Textarea);
        const texts: string[] = [];
        for (const li of await page.locator(Selector.TextBox).all()) {
            texts.push((await li.innerText()) || "");
        }
        const context = texts.join("").split("\n");
        const start = Date.now();
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.StartTyping }).click();
        await locator.focus();
        for (let i = 0; i < context.length; i++) {
            const key = context[i];
            for (let j = 0; j < key.length; j++) {
                if (this.isSpace(key[j])) {
                    await page.keyboard.press("Space");
                } else await locator.type(key[j], { delay: 5 });
            }
            // await locator.type(key, {delay: 50})
            await page.keyboard.press("Space");
            // await locator.press('Enter')
            await new Promise(f => setTimeout(f, 1000));
            if (Date.now() - start > 50000) break;
        }
        await new Promise(f => setTimeout(f, 1000));
        await locator.press("Escape");
        await page.waitForSelector(Selector.Finish);
        // expect(1).toEqual(0)

        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
    }

    async start(page: Page, devices: Device[], participants: Participant[]) {
        const output: Record<string, Record<string, TypingPraticeDetails>> = {};
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const key = `${device.DeviceName}-${device.ModelName}`;
            for (let j = 0; j < participants.length; j++) {
                const account = participants[j].Account;
                await this.startOne(page, device.Id, account);
                // output[account][key] = await this.startOne(page, device.Id, account);
            }
        }
        return output;
    }
}

export { TypingPratice };
