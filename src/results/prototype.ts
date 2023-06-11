import { Page } from "@playwright/test";

import { HTML } from "../http/constants";
import {
    DragAndDropResultDetail,
    DragAndDropResultRow,
    WinfittsResultDetail,
    WinfittsResultRow,
} from "./interface";

const Selector = {
    Table: "#formRemoveRowData > div.block-table > table > tbody",
} as const;

type result = WinfittsResultRow | DragAndDropResultRow;
type detail = WinfittsResultDetail | DragAndDropResultDetail;

class Result {
    protected async parseHTML(page: Page) {
        const rows: string[][] = [];
        await page.waitForSelector(Selector.Table);
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

    protected toCanonicalResult(array: ReadonlyArray<string[]>, start: number): result[] {
        throw new Error("Not Implement");
    }

    protected convertToResults(array: string[][]): Record<string, detail> {
        throw new Error("Not Implement");
    }

    async fetchAll(page: Page, id: string): Promise<Record<string, detail>> {
        throw new Error("Not Implement");
    }
}

export { Result };
