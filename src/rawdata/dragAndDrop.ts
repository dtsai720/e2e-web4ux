import { Page, Locator } from "@playwright/test";

import { RawData } from "./prototype";
import { URL } from "../http/constants";
import { Selector } from "./constants";
import {
    DragAndDropDetail,
    DragAndDropFetchOne,
    DragAndDropRawDataResult,
    IRawData,
} from "./interface";

class DragAndDropRawData extends RawData implements IRawData {
    protected toCanonicalHead(array: ReadonlyArray<string>) {
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            DragSide: array[4],
            NumberOfMove: array[5],
            EventTime: Number(array[6]),
        } as const;
    }

    protected toCanonicalDetail(array: string[]) {
        return {
            Index: array[0],
            EventType: array[1],
            DragSide: array[4],
            EventTime: Number(array[5]),
        } as const;
    }

    protected toCanonicalTitle(array: ReadonlyArray<string>) {
        return {
            FileIndex: array[0],
            IsPassed: array[1] === "True",
            EventTime: Number(array[3]),
        } as const;
    }

    protected async detail(locator: Locator) {
        const candidates = await this.prepareDetail(locator);
        const output: DragAndDropDetail[] = [];
        for (let i = 0; i < candidates.length; i++) {
            output.push(this.toCanonicalDetail(candidates[i]));
        }
        return output;
    }

    protected async result(locator: Locator) {
        const results: DragAndDropRawDataResult[] = [];
        for (const each of await locator.locator(Selector.TrailPack).all()) {
            const Title = await this.title(each);
            if (!("FileIndex" in Title)) continue;
            if (isNaN(Title.EventTime)) continue;
            const Detail = await this.detail(each);
            results.push({ Title, Detail });
        }
        return results;
    }

    protected async fetchOne(row: Locator): Promise<DragAndDropFetchOne> {
        const participant = await this.head(row);
        if (!("DragSide" in participant)) throw new Error("");
        return {
            Account: participant.Account,
            ModelName: participant.ModelName,
            DeviceName: participant.DeviceName,
            ArrowTo: participant.DragSide,
            NumberOfMove: participant.NumberOfMove,
            EventTime: participant.EventTime,
            Result: await this.result(row),
        } as const;
    }

    async fetchAll(page: Page, resultId: string) {
        const url = [URL.DragAndDropRawDataPrefix, resultId].join("/");
        await page.goto(url);
        await page.waitForSelector(Selector.Table);
        const table = page.locator(Selector.Table);
        const output: Record<string, Record<string, DragAndDropFetchOne[]>> = {};
        for (const row of await table.locator(Selector.Row).all()) {
            const detail = await this.fetchOne(row);
            const account = detail.Account;
            const key = `${detail.ModelName}-${detail.DeviceName}`;
            if (output[account] === undefined) output[account] = {};
            if (output[account][key] === undefined) output[account][key] = [];
            output[account][key].push(detail);
        }
        return output;
    }
}

export { DragAndDropRawData };
