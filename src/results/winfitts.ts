import { Result } from "./prototype";
import { IResult, WinfittsResultDetail, WinfittsResultRow } from "./interface";
import { URL } from "../http/constants";
import { Page } from "@playwright/test";

class WinfittsResult extends Result implements IResult {
    private steps = 4;
    protected toCanonicalResult(array: ReadonlyArray<string[]>, start: number) {
        const output: WinfittsResultRow[] = [];
        for (let i = 0; i < 4; i++) {
            const Id = Number(array[start + i][0]);
            const wd = array[start + i][1].split("/");
            const Width = Number(wd[0]);
            const Distance = Number(wd[1]);
            const CursorMovementTime = Number(array[start + i][2]);
            const ErrorRate = Number(array[start + i][3].replace(" %", "")) * 0.01;
            output.push({ Id, Width, Distance, CursorMovementTime, ErrorRate });
        }
        return output;
    }

    protected convertToResults(array: string[][]): Record<string, WinfittsResultDetail> {
        const output: Record<string, WinfittsResultDetail> = {};
        for (let i = 0; i < array.length; i += this.steps) {
            array[i].shift(); // remove index
            const account = array[i].shift() || "";
            output[account] = {
                Account: account,
                Details: this.toCanonicalResult(array, i),
            };
        }
        return output;
    }

    async fetchAll(page: Page, resultId: string): Promise<Record<string, WinfittsResultDetail>> {
        const url = [URL.WinfittsResultPrefix, resultId].join("/");
        await page.goto(url);
        const array = await this.parseHTML(page);
        const output = this.convertToResults(array);
        return output;
    }
}

export { WinfittsResult };
