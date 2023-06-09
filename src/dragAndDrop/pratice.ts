import { Page } from "@playwright/test";

import { Participant } from "../project/interface";
import { Pratice } from "../project/pratice";
import { HTML } from "../http/constants";
import { Selector } from "./constants";
import { Settings } from "../config";

class DragAndDorpPratices extends Pratice {
    async start(page: Page, participant: Participant) {
        await super.start(page, participant);
        // after dragAndDrop x++, y++
        const y = 1;
        for (let idx = 1; idx <= 2; idx++) {
            const array = Array.from(Array(10).keys()).sort(() => 0.5 - Math.random());
            await page.waitForSelector(Selector.Target(idx));
            const target = await page.locator(Selector.Target(idx));
            const window = await page.locator(Selector.Window(idx));
            const windowBox = await window.boundingBox();
            const to = await target.boundingBox();
            for (let i = 0; i < array.length; i++) {
                const locator = await page.locator(Selector.File(idx, array[i] + 1)).first();
                const from = await locator.boundingBox();
                const delay = Math.random() * 100 + 20;
                if (from === null || to === null || windowBox === null) throw new Error("");

                if (i === 0) {
                    // dblClick
                    await locator.dblclick();
                    await page.waitForSelector(Selector.Close(idx));
                    await page.locator(Selector.Close(idx)).click();
                } else if (i === 1) {
                    // desktop
                    const steps = idx === 1 ? windowBox.width + 1 : -2;
                    const x = windowBox.x - from.x + steps;
                    await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
                } else if (i === 2) {
                    // folder
                    const x = 1;
                    await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
                } else if (i === 3) {
                    // overshot
                    const x = idx === 1 ? -from.x + to.x + to.width + 1 : -from.x + to.x - 2;
                    await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
                }
                await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
                if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, delay));

                await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
                await locator.dragTo(target);
                if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, delay));
            }

            await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
            if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, delay));
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
    }
}

export { DragAndDorpPratices };
