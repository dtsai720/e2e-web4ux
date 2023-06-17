import { Locator, Page } from "@playwright/test";
import { RawData } from "./prototype";
import { TypingDetail, TypingFetchOne, TypingResult } from "./interface";
import { Selector } from "./constants";
import { URL } from "../http/constants";

class TypingRawData extends RawData {
    protected toCanonicalHead(array: ReadonlyArray<string>) {
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            Accuracy: Number(array[5].replace("%", "").trim()),
            WPM: Number(array[6]),
            TypingTime: Number(array[7]),
            EventTime: Number(array[8]),
        } as const;
    }

    protected toCanonicalDetail(array: string[]) {
        const Details = [...array];
        const Event = Details[1];
        Details.shift();
        Details.shift();
        return { Details, Event };
    }

    protected async detail(locator: Locator) {
        const candidates = await this.prepareDetail(locator);
        const output: TypingDetail[] = [];
        for (let i = 0; i < candidates.length; i++) {
            output.push(this.toCanonicalDetail(candidates[i]));
        }
        return output;
    }

    protected async result(locator: Locator) {
        const results: TypingResult[] = [];
        for (const each of await locator.locator(Selector.TrailPack).all()) {
            const Detail = await this.detail(each);
            if (Detail.length === 0) continue;
            results.push({ Detail });
        }
        return results;
    }

    protected async fetchOne(row: Locator) {
        const participant = await this.head(row);
        if (!("Accuracy" in participant)) throw new Error("");
        return {
            Account: participant.Account,
            DeviceName: participant.DeviceName,
            ModelName: participant.ModelName,
            EventTime: participant.EventTime,
            Accuracy: participant.Accuracy,
            WPM: participant.WPM,
            TypingTime: participant.TypingTime,
            Results: await this.result(row),
        } as const;
    }

    async fetchAll(page: Page, resultId: string) {
        const url = [URL.TypingRawDataPrefix, resultId].join("/");
        await page.goto(url);
        await page.waitForSelector(Selector.Table);
        const table = page.locator(Selector.Table);
        const output: Record<string, Record<string, TypingFetchOne>> = {};
        for (const row of await table.locator(Selector.Row).all()) {
            const detail = await this.fetchOne(row);
            const account = detail.Account;
            if (output[account] === undefined) output[account] = {};
            const key = `${detail.ModelName}-${detail.DeviceName}`;
            output[account][key] = detail;
        }
        return output;
    }
}

export { TypingRawData };
