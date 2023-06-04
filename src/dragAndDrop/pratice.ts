import { Page } from "@playwright/test";

import { Participant } from "../project/interface";
import { Pratice } from "../project/pratice";
import { HTML } from "../http/constants";
import { Selector } from "./constants";

class DragAndDorpPratices extends Pratice {
    async start(page: Page, participant: Participant) {
        await super.start(page, participant);
        for (let idx = 1; idx <= 2; idx++) {
            await page.waitForSelector(Selector.Target(idx));
            const target = await page.locator(Selector.Target(idx));
            for (let i = 1; i <= 10; i++) {
                const locator = page.locator(Selector.File(idx, i)).first();
                await locator.dragTo(target);
                // await new Promise(f => setTimeout(f, 20));
            }
            // await new Promise(f => setTimeout(f, 20));
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
    }
}

export { DragAndDorpPratices };
