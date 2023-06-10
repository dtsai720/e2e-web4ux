import { Page } from "@playwright/test";

import { Settings } from "../config";
import { Position, EuclideanDistance } from "../math";
import { HTML } from "../http/constants";
import { ClickEvent, IPratice, WinfittsDetails } from "./interface";
import { Pratice } from "./prototype";
import { Participant } from "../project/interface";

const Selector = {
    Pratices: {
        Start: ".start.dot",
        Target: ".target.dot",
        Light: { Start: ".start.dot.light", Target: ".target.dot.light" },
    },
    Result: { Table: "#formRemoveRowData > div.block-table > table > tbody" },
} as const;

const TotalTrailCount = 32;

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

    private async runOnce(page: Page) {
        await page.waitForSelector(Selector.Pratices.Light.Start);
        await this.delay();
        const start = page.locator(Selector.Pratices.Start);
        const target = page.locator(Selector.Pratices.Target);
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();

        await this.delay();
        await start.click();
        if (startBox === null || targetBox === null) throw new Error("position cannot be null");

        const Start = NewClickEvent(startBox.x, startBox.y, Math.floor(Date.now()));
        const Target = NewClickEvent(targetBox.x, targetBox.y, 0);
        const distance = EuclideanDistance(Start, Target) / Settings.Calibrate;
        const width = targetBox.width / Settings.Calibrate;
        const Width = this.width(width);
        const Distance = this.distance(distance);
        const difficulty = this.difficulty(width, distance);
        const range = this.range(difficulty);
        const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
        const current = { X: Start.X, Y: Start.Y };
        let Else: null | ClickEvent = null;
        if (this.isFailed(difficulty)) {
            const X = (Start.X + Target.X) / 2;
            const Y = (Start.Y + Target.Y) / 2;
            await this.move(page, current, { X, Y }, sleepTime / Settings.MouseMoveDelay);
            await page.mouse.click(X, Y);
            Else = NewClickEvent(X, Y, Math.floor(Date.now()));
            if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
        }

        await page.waitForSelector(Selector.Pratices.Light.Target);
        await this.move(page, current, Target, sleepTime / Settings.MouseMoveDelay);
        if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
        await target.click();
        Target.Timestamp = Math.floor(Date.now());
        return { Start, Target, Else, Width, Distance };
    }
    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        const results: WinfittsDetails = { Account: account, Details: [] };
        for (let i = 0; i < TotalTrailCount; i++) {
            results.Details.push(await this.runOnce(page));
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        return results;
    }

    async start(page: Page, deviceId: string, participants: Participant[]) {
        const output: Record<string, WinfittsDetails> = {};
        for (let i = 0; i < participants.length; i++) {
            const account = participants[i].Account;
            output[account] = await this.startOne(page, deviceId, account);
        }
        return output;
    }
}

export { WinfittsPratices };
