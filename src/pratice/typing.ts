import { Page, expect } from "@playwright/test";

import { Pratice } from "./prototype";
import { Participant } from "../project/interface";

class TypingPratice extends Pratice {
    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        const locator = page.locator("#textarea");
        const texts: string[] = [];
        for (const li of await page.locator("body > div.tping-test > div.queBox > div").all()) {
            texts.push((await li.innerText()) || "");
        }
        const context = texts.join("").split("\n");
        const start = Date.now();
        await page.getByRole("button", { name: "Start Typing" }).click();
        await locator.focus();
        for (let i = 0; i < context.length; i++) {
            const key = context[i];
            for (let j = 0; j < key.length; j++) {
                if (/^\s*$/.test(key[j])) {
                    console.log("enter space");
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
        await page.waitForSelector("#btnFinish");
        // expect(1).toEqual(0)

        await page.getByRole("button", { name: "Finish" }).click();
    }

    async start(page: Page, deviceId: string, participants: Participant[]) {
        for (let i = 0; i < participants.length; i++) {
            const account = participants[i].Account;
            await this.startOne(page, deviceId, account);
        }
    }
}

export { TypingPratice };
