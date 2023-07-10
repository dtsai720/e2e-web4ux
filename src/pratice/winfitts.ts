import { Locator, Page } from "@playwright/test";

import { Settings } from "../config";
import { Position, EuclideanDistance } from "../math";
import { HTML } from "../http/constants";
import { ClickEvent, IPratice, WinfittsPraticeDetails } from "./interface";
import { Pratice } from "./prototype";
import { Device, Participant } from "../project/interface";

const Selector = {
    Pratices: {
        Start: ".start.dot",
        Target: ".target.dot",
        Light: { Start: ".start.dot.light", Target: ".target.dot.light" },
    },
    Result: { Table: "#formRemoveRowData > div.block-table > table > tbody" },
} as const;

const TotalTrailCount = 32;
interface ClickElseRequest {
    current: Position;
    FailedPosition: Position;
    sleepTime: number;
    difficulty: number;
}
interface BeforeStartCliclRequest {
    target: Locator;
    FailedPosition: Position;
    Target: Position;
    current: Position;
    sleepTime: number;
}

const NewClickEvent = (x: number, y: number, timestamp: number) => {
    return { X: x, Y: y, Timestamp: timestamp };
};

class WinfittsPratices extends Pratice implements IPratice {
    private width(w: number) {
        return Math.abs(w - 3) < Math.abs(w - 15) ? 3 : 15;
    }

    private distance(d: number) {
        return Math.abs(d - 30) < Math.abs(d - 150) ? 30 : 150;
    }

    private difficulty(w: number, d: number) {
        const width = this.width(w);
        const distance = this.distance(d);
        if (width === 3) return distance === 30 ? 3.5 : 5.7;
        return distance === 30 ? 1.6 : 3.5;
    }
    private range(d: number): Readonly<{ Max: number; Min: number }> {
        if (d == 1.6) return { Max: 500, Min: 350 };
        if (d == 3.5) return { Max: 750, Min: 500 };
        if (d == 5.7) return { Max: 1200, Min: 900 };
        return { Max: 300, Min: 100 };
    }
    private async delay() {
        if (!Settings.EnableTimeSleep) return;
        await new Promise(f => setTimeout(f, Math.random() * 20 + 10));
    }

    private isFailed(d: number) {
        return Math.random() * 100 <= (Settings.WinfittsFailedRate * d) / (1.6 + 3.5 + 5.7);
    }

    private async move(page: Page, from: Position, to: Position, steps: number) {
        if (!Settings.EnableTimeSleep) return;
        const stepX = (to.X - from.X) / steps;
        const stepY = (to.Y - from.Y) / steps;
        for (let i = 0; i < steps; i++) {
            from.X += stepX;
            from.Y += stepY;
            await page.mouse.move(from.X, from.Y);
        }
    }

    private async runOneParams(start: Locator, target: Locator) {
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();

        if (startBox === null || targetBox === null) throw new Error("position cannot be null");
        const Start = NewClickEvent(startBox.x, startBox.y, 0);
        const Target = NewClickEvent(targetBox.x, targetBox.y, 0);
        const distance = EuclideanDistance(Start, Target) / Settings.Calibrate;
        const width = targetBox.width / Settings.Calibrate;
        const Width = this.width(width);
        const Distance = this.distance(distance);
        const difficulty = this.difficulty(width, distance);
        const range = this.range(difficulty);
        const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
        const current = { X: Start.X, Y: Start.Y };
        return { Start, Target, Width, Distance, sleepTime, current, difficulty };
    }

    private async beforeStartClick(page: Page, r: BeforeStartCliclRequest) {
        if (Math.random() * 10 <= 8) return null;
        if (Math.random() * 10 > 7) {
            await r.target.click();
            return NewClickEvent(r.Target.X, r.Target.Y, Math.floor(Date.now()));
        }
        await this.move(page, r.current, r.FailedPosition, r.sleepTime / Settings.MouseMoveDelay);
        await page.mouse.click(r.FailedPosition.X, r.FailedPosition.Y);
        return NewClickEvent(r.FailedPosition.X, r.FailedPosition.Y, Math.floor(Date.now()));
    }

    private async dblCkickInStart(start: Locator) {
        if (Math.random() * 10 <= 9) {
            await start.click();
            return { isFailed: false };
        }
        await start.dblclick();
        return { isFailed: true };
    }

    private async clickElse(page: Page, r: ClickElseRequest) {
        if (!this.isFailed(r.difficulty)) return null;
        await this.move(page, r.current, r.FailedPosition, r.sleepTime / Settings.MouseMoveDelay);
        await page.mouse.click(r.FailedPosition.X, r.FailedPosition.Y);
        return NewClickEvent(r.FailedPosition.X, r.FailedPosition.Y, Math.floor(Date.now()));
    }

    private async runOnce(page: Page) {
        await page.waitForSelector(Selector.Pratices.Light.Start);
        await this.delay();
        const start = page.locator(Selector.Pratices.Start);
        const target = page.locator(Selector.Pratices.Target);
        const { Start, Target, Width, Distance, sleepTime, current, difficulty } =
            await this.runOneParams(start, target);
        let IsFailed = false;
        const Else: ClickEvent[] = [];
        const FailedPosition = { X: (Start.X + Target.X) / 2, Y: (Start.Y + Target.Y) / 2 };
        const beforeStartClickRequest = {
            target: target,
            FailedPosition: FailedPosition,
            Target: Target,
            current: current,
            sleepTime: sleepTime,
        } as const;
        const beforeStartClick = await this.beforeStartClick(page, beforeStartClickRequest);
        if (beforeStartClick !== null) {
            Else.push(beforeStartClick);
            this.delay();
        }

        const { isFailed } = await this.dblCkickInStart(start);
        Start.Timestamp = Math.floor(Date.now());
        if (isFailed) {
            Else.push(NewClickEvent(Start.X, Start.Y, Math.floor(Date.now())));
            IsFailed ||= true;
        }
        const cllickRequest = {
            current: current,
            FailedPosition: FailedPosition,
            sleepTime: sleepTime,
            difficulty: difficulty,
        } as const;
        const elseEvent = await this.clickElse(page, cllickRequest);
        if (elseEvent !== null) {
            Else.push(elseEvent);
            if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
            IsFailed ||= true;
        }

        await page.waitForSelector(Selector.Pratices.Light.Target);
        await this.move(page, current, Target, sleepTime / Settings.MouseMoveDelay);
        if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
        await target.click();
        Target.Timestamp = Math.floor(Date.now());
        return { Start, Target, Else, Width, Distance, IsFailed };
    }

    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        const results: WinfittsPraticeDetails = { Account: account, Details: [] };
        for (let i = 0; i < TotalTrailCount; i++) {
            results.Details.push(await this.runOnce(page));
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        return results;
    }

    async start(page: Page, devices: Device[], participants: Participant[]) {
        const output: Record<string, Record<string, WinfittsPraticeDetails>> = {};
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

export { WinfittsPratices, TotalTrailCount };
