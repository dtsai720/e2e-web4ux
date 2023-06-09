import { Locator, Page } from "@playwright/test";

import { Selector } from "./constants";
import { URL, HTML } from "../http/constants";
import { ClickEvent } from "./interface";

interface RawdataSingleRow {
    TrailNumber: number;
    IsFailed: boolean;
    ErrorTime: number;
    Width: number;
    Distance: number;
    Id: number;
    Angle: number;
    EventTime: number;
    Start: ClickEvent;
    Target: ClickEvent;
    Else: ClickEvent[];
}

interface Results {
    Account: string;
    ModelName: string;
    DeviceName: string;
    ErrorRate: string;
    EventTime: number;
    Results: RawdataSingleRow[];
}

const EventType = { Start: "start", Target: "target", Else: "else" } as const;

class WinfittsRawData {
    private url: string;
    constructor(id: string) {
        this.url = [URL.WinfittsRawDataPrefix, id].join("/");
    }

    private async title(locator: Locator) {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.RawData.Head).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            ErrorRate: array[4],
            EventTime: Number(array[5]),
        } as const;
    }

    private async toSimpleWinfittsRow(locator: Locator) {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.RawData.SimpleRow).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return {
            TrailNumber: Number(array[0]),
            IsFailed: array[1] === "Yes",
            ErrorTime: Number(array[2]),
            Width: Number(array[3]),
            Distance: Number(array[4]),
            Id: Number(array[5]),
            Angle: Number(array[6]),
            EventTime: Number(array[7]),
        } as const;
    }

    private async result(locator: Locator) {
        const output: Readonly<RawdataSingleRow>[] = [];
        for (const each of await locator.locator(Selector.RawData.TrailPack).all()) {
            const row = await this.toSimpleWinfittsRow(each);
            const result: RawdataSingleRow = {
                TrailNumber: row.TrailNumber,
                IsFailed: row.IsFailed,
                ErrorTime: row.ErrorTime,
                Width: row.Width,
                Distance: row.Distance,
                Id: row.Id,
                Angle: row.Angle,
                EventTime: row.EventTime,
                Start: { X: 0, Y: 0, Timestamp: 0 },
                Target: { X: 0, Y: 0, Timestamp: 0 },
                Else: [],
            };

            if (isNaN(row.TrailNumber)) continue;
            for (const data of await each.locator(Selector.RawData.ClickResults).all()) {
                const array: string[] = [];
                for (const column of await data.locator(HTML.Tag.Span).all()) {
                    const text = (await column.textContent()) || "";
                    array.push(text.trim());
                }
                array[1] = array[1].slice(1, -1);
                const position = array[1].split(",");
                const event = {
                    X: Number(position[0].trim()),
                    Y: Number(position[1].trim()),
                    Timestamp: Number(array[2]),
                };
                if (array[0] === EventType.Start) result.Start = event;
                else if (array[0] === EventType.Target) result.Target = event;
                else if (array[0] === EventType.Else) result.Else.push(event);
            }
            output.push(result);
        }
        return output;
    }

    async fetch(page: Page): Promise<ReadonlyArray<Results>> {
        await page.goto(this.url);
        await page.waitForSelector(Selector.RawData.Table);
        const table = await page.locator(Selector.RawData.Table);
        const output: Results[] = [];
        for (const row of await table.locator(Selector.RawData.Row).all()) {
            const participant = await this.title(row);
            output.push({
                Account: participant.Account,
                DeviceName: participant.DeviceName,
                ModelName: participant.ModelName,
                ErrorRate: participant.ErrorRate,
                EventTime: participant.EventTime,
                Results: await this.result(row),
            });
        }
        return output;
    }
}

export { WinfittsRawData, RawdataSingleRow };
