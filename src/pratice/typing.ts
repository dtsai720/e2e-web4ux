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
        const texts: string[] = [];
        for (const li of await page.locator(Selector.TextBox).all()) {
            texts.push((await li.innerText()) || "");
        }
        const context = texts.join("").split("\n");
        const start = Date.now();
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.StartTyping }).click();
        await page.mouse.move(0, 0);

        const locator = page.locator(Selector.Textarea);
        await locator.focus();
        let currentText = "";
        const contexts: string[] = [];
        for (let i = 0; i < context.length; i++) {
            for (let j = 0; j < context[i].length; j++) {
                currentText += context[i][j];
                if (this.isSpace(context[i][j])) {
                    await locator.press("Space");
                    if (Date.now() - start > 50000) break;
                } else await locator.type(context[i][j], { delay: 250 });
                if (currentText.includes("and")) {
                    await locator.click({ clickCount: 2 });
                    await locator.press("Delete");
                    await locator.type("a", { delay: 250 });
                    await locator.type("n", { delay: 250 });
                    await locator.type("d", { delay: 250 });
                    contexts.push(currentText);
                    currentText = "";
                }
            }
            if (Date.now() - start > 50000) break;
            await locator.press("Enter");
            currentText += "\n";
        }
        await new Promise(f => setTimeout(f, 1000));
        await locator.press("Escape");
        await page.waitForSelector(Selector.Finish);
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        contexts.push(currentText);
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
