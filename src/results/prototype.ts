import { Page, Locator } from "@playwright/test";

import { detail, summary } from "./interface";
import { HTML } from "../http/constants";
import { Settings } from "../config";

const Selector = {
    Result: {
        Table: "#formRemoveRowData",
        Title: ".blueline-title",
    },
    Summary: ".page-content > div:nth-child(4)",
} as const;

class Result {
    protected urlPrefix: string;
    protected detailLength: number;
    protected summaryLength: number;
    protected async textContent(locator: Locator) {
        const candidates: string[][] = [];
        for (const items of await locator.locator(HTML.Tag.Tr).all()) {
            const array: string[] = [];
            for (const item of await items.locator(HTML.Tag.Td).all()) {
                const text = (await item.textContent()) || "";
                if (text.trim() === "") continue;
                array.push(text.trim());
            }
            if (array.length === 0) continue;
            candidates.push(array);
        }
        return candidates;
    }

    public async summary(page: Page, resultId: string): Promise<Record<string, summary>> {
        const url = [this.urlPrefix, resultId].join("/");
        await page.goto(url);
        const locator = page.locator(Selector.Summary);
        const array = await this.textContent(locator);
        const results: Record<string, summary> = {};
        for (let i = 0; i < array.length; i++) {
            const key = this.toCanonicalSummaryKey(array[i]);
            const detail = this.toCanonicalSummaryDetail(array[i]);
            results[key] = detail;
        }
        return results;
    }

    public async results(
        page: Page,
        resultId: string
    ): Promise<Record<string, Record<string, detail[]>>> {
        await new Promise(f => setTimeout(f, Settings.WaittingResultInSecond));
        const url = [this.urlPrefix, resultId].join("/");
        await page.goto(url);
        const locator = page.locator(Selector.Result.Table);
        const Titles: string[] = [];
        for (const name of await locator.locator(Selector.Result.Title).all()) {
            const text = (await name.textContent()) || "";
            if (text.trim() === "") continue;
            Titles.push(text.trim());
        }
        const Contents = await this.textContent(locator);
        if (Contents.length % Titles.length !== 0) throw new Error("");
        const size = Contents.length / Titles.length;
        const results: Record<string, Record<string, detail[]>> = {};
        let titleIdx = 0;
        for (let i = 0; i < Contents.length; i += size) {
            const names = Titles[titleIdx].split("-");
            const Device = [names[0].trim(), names[1].trim()].join("-");
            titleIdx++;
            let Account = "";
            for (let j = 0; j < size; j++) {
                if (Contents[i + j].length === this.detailLength) {
                    Account = Contents[i + j][1];
                    Contents[i + j].shift();
                    Contents[i + j].shift();
                }
                if (results[Account] === undefined) results[Account] = {};
                if (results[Account][Device] === undefined) results[Account][Device] = [];
                results[Account][Device].push(this.toCanonicalResults(Contents[i + j], Account));
            }
        }
        return results;
    }

    protected toCanonicalSummaryDetail(array: string[]): summary {
        throw new Error("Not Implement");
    }

    protected toCanonicalSummaryKey(array: string[]): string {
        throw new Error("Not Implement");
    }

    protected toCanonicalResults(array: string[], Account: string): detail {
        throw new Error("Not Implement");
    }
}

export { Result };
