import { Locator, Page } from "@playwright/test";

import { HTML } from "../http/constants";
import { Settings } from "../config";
import { Pratice } from "./prototype";
import { DragAndDropDetails, DragAndDropEvent, DragAndDropResult, IPratice } from "./interface";
import { DragSide, EventType } from "./constants";
import { Participant } from "../project/interface";

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

const Selector = {
    File: (idx: number, num: number) => {
        return `#divStep${idx} > div.windowBox > div:nth-child(${num})`;
    },
    Target: (idx: number) => {
        return `#divStep${idx} > div.target.file`;
    },
    Close: (idx: number) => {
        return `#divStep${idx} > div.openWindow.ui-draggable.ui-draggable-handle > button`;
    },
    Window: (idx: number) => {
        return `#divStep${idx} > div.windowBox`;
    },
} as const;

class DragAndDorpPratices extends Pratice implements IPratice {
    private async delay() {
        if (!Settings.EnableTimeSleep) return;
        await new Promise(f => setTimeout(f, Math.random() * 100 + 20));
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

    private async moveToNext(
        page: Page,
        praticeIdx: number,
        fileIdx: number,
        target: Locator,
        window: Locator
    ) {
        const locator = page.locator(Selector.File(praticeIdx, fileIdx)).first();
        const from = await locator.boundingBox();
        if (from === null) throw new Error("from cannot be null");
        const choice = Math.random() * 100;
        const output: DragAndDropEvent[] = [];
        if (choice > 85) {
            await this.dblclick(page, locator, praticeIdx);
            output.push({ EventType: EventType.DobuleClick, DragSide: DragSide.Folder });
        } else if (choice > 70) {
            const windowBox = await window.boundingBox();
            if (windowBox === null) throw new Error("box cannot be null");
            await this.moveToDesktop(locator, praticeIdx, from, windowBox);
            output.push({ EventType: EventType.DragAndDrop, DragSide: DragSide.Desktop });
        } else if (choice > 55) {
            await this.moveToFolder(locator);
            output.push({ EventType: EventType.DragAndDrop, DragSide: DragSide.Folder });
        } else if (choice > 40) {
            const to = await target.boundingBox();
            if (to === null) throw new Error("target cannot be null");
            await this.moveToOvershot(locator, praticeIdx, from, to);
            output.push({ EventType: EventType.DragAndDrop, DragSide: DragSide.Overshot });
        }

        await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
        await this.delay();

        await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
        await locator.dragTo(target);
        await this.delay();
        output.push({ EventType: EventType.DragAndDrop, DragSide: DragSide.Target });
        return output;
    }

    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        // after dragAndDrop x++, y++
        const output: DragAndDropDetails = { Account: account, ArrowToRight: [], ArrowToLeft: [] };
        for (let praticeIdx = 1; praticeIdx <= 2; praticeIdx++) {
            await page.waitForSelector(Selector.Target(praticeIdx));
            const target = page.locator(Selector.Target(praticeIdx));
            const window = page.locator(Selector.Window(praticeIdx));
            const results: DragAndDropResult[] = [];
            for (let fileIdx = 1; fileIdx <= 10; fileIdx++) {
                const Events = await this.moveToNext(page, praticeIdx, fileIdx, target, window);
                const FileIndex = `file${fileIdx}`;
                const IsPassed = Events.length === 1;
                results.push({ Events, FileIndex, IsPassed });
            }
            praticeIdx === 1 ? (output.ArrowToRight = results) : (output.ArrowToLeft = results);
            await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
            await this.delay();
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        return output;
    }

    async start(page: Page, deviceId: string, participants: Participant[]) {
        const output: Record<string, DragAndDropDetails> = {};
        for (let i = 0; i < participants.length; i++) {
            const account = participants[i].Account;
            output[account] = await this.startOne(page, deviceId, account);
        }
        return output;
    }
}

export { DragAndDorpPratices };
