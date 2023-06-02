import { Page } from "@playwright/test";

import { Device, Participant } from "../project/interface";
import { URL, HTML } from "../http/constants";
import { Settings } from "../config";
import { Selector } from "./constants";
import { EuclideanDistance } from "../math";
import { Normalize } from "./tools";
import { ClickEvent } from "./interface";

interface SingleWinfittsResult {
    Start: ClickEvent;
    Target: ClickEvent;
    Else: ClickEvent | null;
    Width: number;
    Distance: number;
}

interface PraticeResult {
    Account: string;
    Results: SingleWinfittsResult[];
}

const TotalTrailCount = 32;

const NewClickEvent = (x: number, y: number, timestamp: number): ClickEvent => {
    return { X: x, Y: y, Timestamp: timestamp };
};

const NewSingleWinfittsResult = (): SingleWinfittsResult => {
    return {
        Start: NewClickEvent(0, 0, 0),
        Target: NewClickEvent(0, 0, 0),
        Else: null,
        Width: 0,
        Distance: 0,
    };
};

class WinfittsPratices {
    private url: string;

    constructor(device: Device) {
        this.url = [URL.StartWinfittsPrefix, device.Id].join("/");
    }

    private range(d: number): Readonly<{ Max: number; Min: number }> {
        if (d == 1.6) return { Max: 500, Min: 350 };
        if (d == 3.5) return { Max: 750, Min: 500 };
        if (d == 5.7) return { Max: 1200, Min: 900 };
        return { Max: 300, Min: 100 };
    }

    private hasFailed(d: number) {
        return Math.random() * 100 <= (Settings.WinfittsFailedRate * d) / (1.6 + 3.5 + 5.7);
    }

    private async eachTrail(page: Page) {
        await page.waitForSelector(Selector.Pratices.Light.Start);
        const start = await page.locator(Selector.Pratices.Start);
        const target = await page.locator(Selector.Pratices.Target);
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();

        if (Settings.EnableTimeSleep)
            await new Promise(f => setTimeout(f, Math.random() * 20 + 10));

        await start.click();

        if (startBox === null || targetBox === null) throw new Error("cannot be null");

        const result = NewSingleWinfittsResult();
        result.Start = NewClickEvent(startBox.x, startBox.y, Math.floor(Date.now()));
        result.Target.X = targetBox.x;
        result.Target.Y = targetBox.y;

        const distance = EuclideanDistance(result.Start, result.Target) / Settings.Calibrate;
        const width = targetBox.width / Settings.Calibrate;

        result.Width = Normalize.width(width);
        result.Distance = Normalize.distance(distance);

        const difficulty = Normalize.difficulty(width, distance);
        const range = this.range(difficulty);
        const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
        if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));

        if (this.hasFailed(difficulty)) {
            const x = (result.Start.X + result.Target.X) / 2;
            const y = (result.Start.Y + result.Target.Y) / 2;
            await page.mouse.move(x, y);
            await page.mouse.click(x, y);

            result.Else = NewClickEvent(x, y, Math.floor(Date.now()));
            const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
            if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
        }

        await page.waitForSelector(Selector.Pratices.Light.Target);
        await page.mouse.move(result.Target.X, result.Target.Y);
        await target.click();
        result.Target.Timestamp = Math.floor(Date.now());
        return result;
    }

    async start(page: Page, participant: Participant): Promise<Readonly<PraticeResult>> {
        await page.goto(this.url);
        await page.getByLabel(HTML.Label.Account).fill(participant.Account);
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Starts }).click();
        await page.getByRole(HTML.Role.Link, { name: HTML.Role.Name.Start }).click();
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Start }).click();

        const output: SingleWinfittsResult[] = [];
        for (let i = 0; i < TotalTrailCount; i++) {
            output.push(await this.eachTrail(page));
        }
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        return { Account: participant.Account, Results: output } as const;
    }
}

export { WinfittsPratices, PraticeResult };
