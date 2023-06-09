import { Locator, Page } from "@playwright/test";

import { URL } from "../http/constants";
import { Selector } from "./constants";

interface SimpleResult {
    Title: SimpleRow;
    Detail: ReadonlyArray<Detail>;
}

interface Result {
    Account: string;
    ModelName: string;
    DeviceName: string;
    DragSide: string;
    NumberOfMove: string;
    EventTime: number;
    Result: ReadonlyArray<SimpleResult>;
}

interface SimpleRow {
    FileIndex: string;
    IsPassed: boolean;
    EventTime: number;
}

interface Detail {
    Index: string;
    EventType: string;
    PositionType: string;
    EventTime: number;
}

class DragAndDropRawData {
    private url: string;
    constructor(id: string) {
        this.url = [URL.DragAndDropRawDataPrefix, id].join("/");
    }

    private async head(locator: Locator) {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.RawData.Head).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            DragSide: array[4],
            NumberOfMove: array[5],
            EventTime: Number(array[6]),
        } as const;
    }

    private async detail(locator: Locator): Promise<ReadonlyArray<Detail>> {
        const array: Detail[] = [];
        for (const column of await locator.locator(Selector.RawData.ClickResults).all()) {
            const text = (await column.textContent()) || "";
            const nums = text.trim().split("\n");
            const arr: string[] = [];
            for (let i = 0; i < nums.length; i++) {
                if (nums[i].trim() === "") continue;
                arr.push(nums[i].trim());
            }
            array.push({
                Index: arr[0],
                EventType: arr[1],
                PositionType: arr[4],
                EventTime: Number(arr[5]),
            });
        }
        return array;
    }

    private async title(locator: Locator): Promise<Readonly<SimpleRow>> {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.RawData.SimpleRow).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return {
            FileIndex: array[0],
            IsPassed: array[1] === "True",
            EventTime: Number(array[3]),
        };
    }

    private async result(locator: Locator) {
        const results: SimpleResult[] = [];
        for (const each of await locator.locator(Selector.RawData.TrailPack).all()) {
            const result: SimpleResult = {
                Title: { FileIndex: "", IsPassed: false, EventTime: 0 },
                Detail: [],
            };
            const title = await this.title(each);
            if (isNaN(title.EventTime)) continue;
            result.Title = title;
            result.Detail = await this.detail(each);
            results.push(result);
        }
        return results;
    }

    private async fetchOne(row: Locator): Promise<Readonly<Result>> {
        const participant = await this.head(row);
        return {
            Account: participant.Account,
            ModelName: participant.ModelName,
            DeviceName: participant.DeviceName,
            DragSide: participant.DragSide,
            NumberOfMove: participant.NumberOfMove,
            EventTime: participant.EventTime,
            Result: await this.result(row),
        };
    }

    async fetch(page: Page): Promise<ReadonlyArray<Result>> {
        await page.goto(this.url);
        await page.waitForSelector(Selector.RawData.Table);
        const table = await page.locator(Selector.RawData.Table);
        const output: Result[] = [];
        for (const row of await table.locator(Selector.RawData.Row).all()) {
            output.push(await this.fetchOne(row));
        }
        return output;
    }
}

export { DragAndDropRawData };
