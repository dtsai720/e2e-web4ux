import { Page } from "@playwright/test";

import { HTML } from "../http/constants";

const Selector = {
    Table: "#formRemoveRowData > div.block-table > table > tbody",
} as const;

interface Results {
    Account: string;
    Results: Record<string, any>[];
}

class IResults {
    protected url: string;
    protected id: string;
    constructor(id: string) {
        this.id = id;
    }

    protected toCanonicalResult(
        array: ReadonlyArray<string[]>,
        start: number
    ): Record<string, any>[] {
        throw new Error("");
    }

    protected convertToResults(array: string[][]): ReadonlyArray<Results> {
        const output: Results[] = [];
        for (let i = 0; i < array.length; i += 4) {
            array[i].shift(); // remove index
            const account = array[i].shift() || "";
            output.push({
                Account: account,
                Results: this.toCanonicalResult(array, i),
            });
        }
        return output;
    }

    protected async parseHTML(page: Page) {
        const rows: string[][] = [];
        const table = page.locator(Selector.Table);
        for (const row of await table.locator(HTML.Tag.Tr).all()) {
            const array: string[] = [];
            for (const data of await row.locator(HTML.Tag.Td).all()) {
                const text = (await data.textContent()) || "";
                if (text.trim() === "") continue;
                array.push(text.trim());
            }
            rows.push(array);
        }
        return rows;
    }

    async fetchAll(page: Page) {
        await page.goto(this.url);
        const array = await this.parseHTML(page);
        const output = this.convertToResults(array);
        return output;
    }
}

export { IResults };
