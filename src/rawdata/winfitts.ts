import { Locator, Page } from "@playwright/test";

import { URL } from "../http/constants";
import { RawData } from "./prototype";
import { WinfittsDetail, WinfittsFetchOne, WinfittsResult } from "./interface";

const Selector = {
    Table: "#divData",
    Head: "div.data1 > span",
    Row: "div.data1-pack",
    TrailPack: "div.data2-pack",
    SimpleRow: "div.data2 > span",
    ClickResults: "div.data3",
} as const;

class WinfittsRawData extends RawData {
    protected toCanonicalHead(array: ReadonlyArray<string>) {
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            ErrorRate: array[4],
            EventTime: Number(array[5]),
        } as const;
    }

    protected toCanonicalTitle(array: ReadonlyArray<string>) {
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

    protected toCanonicalDetail(array: string[]) {
        array[1] = array[1].slice(1, -1);
        const position = array[1].split(",");
        return {
            EventType: array[0],
            X: Number(position[0].trim()),
            Y: Number(position[1].trim()),
            Timestamp: Number(array[2]),
        };
    }

    protected async detail(locator: Locator) {
        // TODO: from array to start, else, target
        const candidates = await this.prepareDetail(locator);
        const output: WinfittsDetail[] = [];
        for (let i = 0; i < candidates.length; i++) {
            output.push(this.toCanonicalDetail(candidates[i]));
        }
        return output;
    }

    protected async result(locator: Locator) {
        const results: WinfittsResult[] = [];
        for (const each of await locator.locator(Selector.TrailPack).all()) {
            const Title = await this.title(each);
            if (!("Width" in Title)) continue;
            if (isNaN(Title.EventTime)) continue;
            const Detail = await this.detail(each);
            results.push({ Title, Detail });
        }
        return results;
    }

    protected async fetchOne(row: Locator) {
        const participant = await this.head(row);
        if (!("ErrorRate" in participant)) throw new Error("");
        return {
            Account: participant.Account,
            DeviceName: participant.DeviceName,
            ModelName: participant.ModelName,
            ErrorRate: participant.ErrorRate,
            EventTime: participant.EventTime,
            Results: await this.result(row),
        } as const;
    }

    async fetchAll(page: Page, resultId: string) {
        const url = [URL.WinfittsRawDataPrefix, resultId].join("/");
        await page.goto(url);
        await page.waitForSelector(Selector.Table);
        const table = page.locator(Selector.Table);
        const output: Record<string, WinfittsFetchOne> = {};
        for (const row of await table.locator(Selector.Row).all()) {
            const detail = await this.fetchOne(row);
            const account = detail.Account;
            output[account] = detail;
        }
        return output;
    }
}

export { WinfittsRawData };