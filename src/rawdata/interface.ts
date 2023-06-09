import { Locator, Page } from "@playwright/test";

const Selector = {
    Table: "#divData",
    Head: "div.data1 > span",
    Row: "div.data1-pack",
    TrailPack: "div.data2-pack",
    SimpleRow: "div.data2 > span",
    ClickResults: "div.data3",
} as const;

interface Result {
    Title: object;
    Detail: Array<object>;
}

class IRawData {
    protected url: string;

    protected toCanonicalHead(array: ReadonlyArray<string>): Record<string, any> {
        throw new Error("Not Implement");
    }

    protected async head(locator: Locator): Promise<Record<string, any>> {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.Head).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return this.toCanonicalHead(array);
    }

    protected toCanonicalDetail(array: ReadonlyArray<string>): Record<string, any> {
        throw new Error("Not Implement");
    }

    protected async detail(locator: Locator) {
        const array: Record<string, any>[] = [];
        for (const column of await locator.locator(Selector.ClickResults).all()) {
            const text = (await column.textContent()) || "";
            const nums = text.trim().split("\n");
            const arr: string[] = [];
            for (let i = 0; i < nums.length; i++) {
                if (nums[i].trim() === "") continue;
                arr.push(nums[i].trim());
            }
            array.push(this.toCanonicalDetail(arr));
        }
        return array;
    }

    protected toCanonicalTitle(array: ReadonlyArray<string>): Record<string, any> {
        throw new Error("Not Implement");
    }

    protected async title(locator: Locator): Promise<Record<string, any>> {
        const array: string[] = [];
        for (const column of await locator.locator(Selector.SimpleRow).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return this.toCanonicalTitle(array);
    }

    protected async result(locator: Locator) {
        const results: Result[] = [];
        for (const each of await locator.locator(Selector.TrailPack).all()) {
            const result: Result = { Title: {}, Detail: [] };
            const title = await this.title(each);
            if (isNaN(title.EventTime)) continue;
            result.Title = title;
            result.Detail = await this.detail(each);
            results.push(result);
        }
        return results;
    }

    protected async fetchOne(row: Locator): Promise<Record<string, any>> {
        throw new Error("Not Implement");
    }

    async fetchAll(page: Page) {
        await page.goto(this.url);
        await page.waitForSelector(Selector.Table);
        const table = await page.locator(Selector.Table);
        const output: Record<string, any>[] = [];
        for (const row of await table.locator(Selector.Row).all()) {
            output.push(await this.fetchOne(row));
        }
        return output;
    }
}

export { IRawData };
