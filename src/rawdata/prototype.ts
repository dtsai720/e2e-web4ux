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
type details = WinfittsDetail[] | DragAndDropDetail[] | TypingDetail[];
type results = WinfittsRawDataResult[] | DragAndDropRawDataResult[] | TypingResult[];
type fetchOne = WinfittsFetchOne | DragAndDropFetchOne | TypingFetchOne;

class RawData {
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

    protected toCanonicalTitle(array: string[]): title {
        throw new Error("Not Implement");
    }

    protected toCanonicalDetail(array: string[]): detail {
        throw new Error("Not Implement");
    }

    protected toCanonicalHead(array: string[]): head {
        throw new Error("Not Implement");
    }

    protected async detail(locator: Locator): Promise<details> {
        throw new Error("Not Implement");
    }

    protected async result(locator: Locator): Promise<results> {
        throw new Error("Not Implement");
    }

    protected async fetchOne(row: Locator): Promise<fetchOne> {
        throw new Error("Not Implement");
    }

    public async fetchAll(page: Page, resultId: string): Promise<fetchAll> {
        throw new Error("Not Implement");
    }
}

export { RawData };
