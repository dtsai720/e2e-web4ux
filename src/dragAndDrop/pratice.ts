import { Locator, Page } from "@playwright/test";

import { Participant } from "../project/interface";
import { Pratice } from "../project/pratice";
import { HTML } from "../http/constants";
import { Selector } from "./constants";
import { Settings } from "../config";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

class DragAndDorpPratices extends Pratice {
    private delay() {
        return Math.random() * 100 + 20;
    }

    private async dblclick(page: Page, locator: Locator, idx: number) {
        await locator.dblclick();
        await page.waitForSelector(Selector.Close(idx));
        await page.locator(Selector.Close(idx)).click();
    }

    private async moveToDesktop(locator: Locator, idx: number, from: Box, box: Box) {
        const y = 1;
        const steps = idx === 1 ? box.width + 1 : -2;
        const x = box.x - from.x + steps;
        await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
    }

    private async moveToFolder(locator: Locator) {
        const x = 1;
        const y = 1;
        await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
    }

    private async moveToOvershot(locator: Locator, idx: number, from: Box, to: Box) {
        const y = 1;
        const x = idx === 1 ? -from.x + to.x + to.width + 1 : -from.x + to.x - 2;
        await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
    }

    private async moveToOtherSide(
        page: Page,
        praticeIdx: number,
        fileIdx: number,
        array: number[],
        target: Locator,
        window: Locator
    ) {
        const locator = page.locator(Selector.File(praticeIdx, array[fileIdx] + 1)).first();
        const from = await locator.boundingBox();
        if (from === null) throw new Error("");

        if (fileIdx === 0) {
            await this.dblclick(page, locator, praticeIdx);
        } else if (fileIdx === 1) {
            const windowBox = await window.boundingBox();
            if (windowBox === null) throw new Error("");
            await this.moveToDesktop(locator, praticeIdx, from, windowBox);
        } else if (fileIdx === 2) {
            await this.moveToFolder(locator);
        } else if (fileIdx === 3) {
            const to = await target.boundingBox();
            if (to === null) throw new Error("");
            await this.moveToOvershot(locator, praticeIdx, from, to);
        }
        await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
        if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, this.delay()));

        await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
        await locator.dragTo(target);
        if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, this.delay()));
    }

    async start(page: Page, participant: Participant) {
        await super.start(page, participant);
        // after dragAndDrop x++, y++
        for (let praticeIdx = 1; praticeIdx <= 2; praticeIdx++) {
            const array = Array.from(Array(10).keys()).sort(() => 0.5 - Math.random());
            await page.waitForSelector(Selector.Target(praticeIdx));
            const target = page.locator(Selector.Target(praticeIdx));
            const window = page.locator(Selector.Window(praticeIdx));

            for (let fileIdx = 0; fileIdx < array.length; fileIdx++) {
                await this.moveToOtherSide(page, praticeIdx, fileIdx, array, target, window);
            }
            await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
            if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, this.delay()));
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        return { Account: participant.Account, Results: [{}] };
    }
}

export { DragAndDorpPratices };
