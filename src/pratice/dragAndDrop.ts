import { Locator, Page } from "@playwright/test";

import { HTML } from "../http/constants";
import { Settings } from "../config";
import { Pratice } from "./prototype";
import { DragSide, EventType } from "./constants";
import { Device, Participant } from "../project/interface";
import {
    DragAndDropPraticeDetails,
    DragAndDropEvent,
    IPratice,
    DragAndDropPraticeResult,
} from "./interface";

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

const TotalFileCount = 10;
const SuccessRate = 60;

class DragAndDropPratices extends Pratice implements IPratice {
    private async delay() {
        if (!Settings.EnableTimeSleep) return;
        await new Promise(f => setTimeout(f, Math.random() * 100 + 20));
    }

    private async dblclick(page: Page, locator: Locator, idx: number) {
        await locator.dblclick();
        await page.waitForSelector(Selector.Close(idx));
        await page.locator(Selector.Close(idx)).click();
        return { EventType: EventType.DobuleClick, DragSide: DragSide.Folder };
    }

    private async moveToDesktop(locator: Locator, idx: number, from: Box, box: Box) {
        const y = 1;
        const steps = idx === 1 ? box.width + 1 : -2;
        const x = box.x - from.x + steps;
        await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
        return { EventType: EventType.DragAndDrop, DragSide: DragSide.Desktop };
    }

    private async moveToFolder(locator: Locator) {
        const x = 1;
        const y = 1;
        await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
        return { EventType: EventType.DragAndDrop, DragSide: DragSide.Folder };
    }

    private async moveToOvershot(locator: Locator, idx: number, from: Box, to: Box) {
        const y = 1;
        const x = idx === 1 ? -from.x + to.x + to.width + 1 : -from.x + to.x - 2;
        await locator.dragTo(locator, { force: true, targetPosition: { x, y } });
        return { EventType: EventType.DragAndDrop, DragSide: DragSide.Overshot };
    }

    private async moveToNext(
        page: Page,
        praticeIdx: number,
        fileIdx: number,
        target: Locator,
        window: Locator
    ) {
        const locator = page.locator(Selector.File(praticeIdx, fileIdx)).first();
        const windowBox = await window.boundingBox();
        if (windowBox === null) throw new Error("box cannot be null");
        const from = await locator.boundingBox();
        if (from === null) throw new Error("from cannot be null");
        const to = await target.boundingBox();
        if (to === null) throw new Error("target cannot be null");
        const choice = Math.random() * 100;
        const output: DragAndDropEvent[] = [];

        if (choice > 90) output.push(await this.dblclick(page, locator, praticeIdx));
        else if (choice > 80)
            output.push(await this.moveToDesktop(locator, praticeIdx, from, windowBox));
        else if (choice > 70) output.push(await this.moveToFolder(locator));
        else if (choice > SuccessRate)
            output.push(await this.moveToOvershot(locator, praticeIdx, from, to));
        await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
        await this.delay();
        await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
        await locator.dragTo(target);
        await this.delay();
        output.push({ EventType: EventType.DragAndDrop, DragSide: DragSide.Target });
        return { Result: output, NumberOfMove: 1 + choice > SuccessRate ? 1 : 0 } as const;
    }

    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        // after dragAndDrop x++, y++
        const output: DragAndDropPraticeDetails = {
            Account: account,
            Details: [],
        };
        for (let praticeIdx = 1; praticeIdx <= 2; praticeIdx++) {
            await page.waitForSelector(Selector.Target(praticeIdx));
            const target = page.locator(Selector.Target(praticeIdx));
            const window = page.locator(Selector.Window(praticeIdx));
            const results: DragAndDropPraticeResult[] = [];
            for (let fileIdx = 1; fileIdx <= TotalFileCount; fileIdx++) {
                const result = await this.moveToNext(page, praticeIdx, fileIdx, target, window);
                const Events = result.Result;
                const NumberOfMove = result.NumberOfMove;
                const FileIndex = `file${fileIdx}`;
                const IsPassed = Events.length === 1;
                results.push({ Events, FileIndex, IsPassed, NumberOfMove });
            }
            output.Details.push(results);
            await new Promise(f => setTimeout(f, Settings.DragAndDropDelay));
            await this.delay();
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        return output;
    }

    async start(page: Page, devices: Device[], participants: Participant[]) {
        const output: Record<string, Record<string, DragAndDropPraticeDetails>> = {};
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const key = `${device.ModelName}-${device.DeviceName}`;
            for (let j = 0; j < participants.length; j++) {
                const account = participants[j].Account;
                if (output[account] === undefined) output[account] = {};
                output[account][key] = await this.startOne(page, device.Id, account);
            }
        }
        return output;
    }
}

export { DragAndDropPratices, TotalFileCount };
