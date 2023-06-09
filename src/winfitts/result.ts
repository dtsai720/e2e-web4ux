import { Page } from "@playwright/test";

import { URL, HTML } from "../http/constants";
import { Selector } from "./constants";

interface ResultSingleRow {
    Id: number;
    Width: number;
    Distance: number;
    CursorMovementTime: number;
    ErrorRate: number;
}

interface Results {
    Account: string;
    Results: ResultSingleRow[];
}

class WinfittsResult {
    private url: string;

    constructor(id: string) {
        this.url = [URL.WinfittsResultPrefix, id].join("/");
    }

    private toWinfittsResult(
        array: Readonly<string[][]>,
        account: string,
        start: number
    ): Readonly<Results> {
        const result: Results = { Account: account, Results: [] };
        for (let i = 0; i < 4; i++) {
            const Id = Number(array[start + i][0]);
            const wd = array[start + i][1].split("/");
            const Width = Number(wd[0]);
            const Distance = Number(wd[1]);
            const CursorMovementTime = Number(array[start + i][2]);
            const ErrorRate = Number(array[start + i][3].replace(" %", "")) * 0.01;
            result.Results.push({ Id, Width, Distance, CursorMovementTime, ErrorRate });
        }
        return result;
    }

    private toCanonical(array: string[][]): ReadonlyArray<Results> {
        const output: Results[] = [];
        for (let i = 0; i < array.length; i += 4) {
            array[i].shift(); // remove index
            const account = array[i].shift() || "";
            output.push(this.toWinfittsResult(array, account, i));
        }
        return output;
    }

    private async parse(page: Page) {
        const rows: string[][] = [];
        const table = await page.locator(Selector.Result.Table);
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

    async fetch(page: Page) {
        await page.goto(this.url);
        const array = await this.parse(page);
        return this.toCanonical(array);
    }
}

export { WinfittsResult, ResultSingleRow };
