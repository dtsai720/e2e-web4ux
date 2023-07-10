import { Locator, Page } from "@playwright/test";

import {
    DragAndDropDetail,
    DragAndDropFetchOne,
    DragAndDropHead,
    DragAndDropRawDataResult,
    DragAndDropTitle,
    TypingDetail,
    TypingFetchOne,
    TypingHead,
    TypingResult,
    TypingTitle,
    WinfittsDetail,
    WinfittsFetchOne,
    WinfittsHead,
    WinfittsRawDataResult,
    WinfittsTitle,
    fetchAll,
} from "./interface";
import { Settings } from "../config";

const Selector = {
    Table: "#divData",
    Head: "div.data1 > span",
    Row: "div.data1-pack",
    TrailPack: "div.data2-pack",
    SimpleRow: "div.data2 > span",
    ClickResults: "div.data3",
} as const;

type head = WinfittsHead | DragAndDropHead | TypingHead;
type title = WinfittsTitle | DragAndDropTitle | TypingTitle;
type detail = WinfittsDetail | DragAndDropDetail | TypingDetail;
type results = WinfittsRawDataResult[] | DragAndDropRawDataResult[] | TypingResult[];
type fetchOne = WinfittsFetchOne | DragAndDropFetchOne | TypingFetchOne;

abstract class RawData {
    protected abstract urlPrefix: string;
    protected async head(locator: Locator): Promise<head> {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.Head).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return this.toCanonicalHead(array);
    }

    protected async title(locator: Locator): Promise<title> {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.SimpleRow).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return this.toCanonicalTitle(array);
    }

    protected async prepareDetail(locator: Locator) {
        const array: string[][] = [];
        for (const column of await locator.locator(Selector.ClickResults).all()) {
            const text = (await column.textContent()) || "";
            const nums = text.trim().split("\n");
            const arr: string[] = [];
            for (let i = 0; i < nums.length; i++) {
                if (nums[i].trim() === "") continue;
                arr.push(nums[i].trim());
            }
            array.push(arr);
        }
        return array;
    }

    protected async *prepareFetchAll(page: Page, resultId: string) {
        await new Promise(f => setTimeout(f, Settings.WaittingResultInSecond));
        const url = [this.urlPrefix, resultId].join("/");
        await page.goto(url);
        await page.waitForSelector(Selector.Table);
        const table = page.locator(Selector.Table);
        for (const row of await table.locator(Selector.Row).all()) {
            yield row;
        }
    }

    protected abstract toCanonicalTitle(array: string[]): title;

    protected abstract toCanonicalDetail(array: string[]): detail;

    protected abstract toCanonicalHead(array: string[]): head;

    protected abstract detail(locator: Locator): Promise<detail[]>;

    protected abstract result(locator: Locator): Promise<results>;

    protected abstract fetchOne(row: Locator): Promise<fetchOne>;

    public abstract fetchAll(page: Page, resultId: string): Promise<fetchAll>;
}

export { RawData };
