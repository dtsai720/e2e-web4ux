import { Page } from "@playwright/test";

import { Result } from "./prototype";
import { URL } from "../http/constants";
import { DragAndDropResultDetail, DragAndDropResultRow, IResult } from "./interface";

class DragAndDropResult extends Result implements IResult {
    private steps = 2;

    protected toCanonicalResult(array: ReadonlyArray<string[]>, start: number) {
        const output: DragAndDropResultRow[] = [];
        for (let i = 0; i < 2; i++) {
            const ArrowTo = array[start + i][0];
            const InFolder = Number(array[start + i][1]);
            const InDesktop = Number(array[start + i][2]);
            const Overshot = Number(array[start + i][3]);
            const DoubleClick = Number(array[start + i][4]);
            const ErrorRate = Number(array[start + i][5].replace(" %", "")) * 0.01;
            output.push({ ArrowTo, InDesktop, InFolder, Overshot, DoubleClick, ErrorRate });
        }
        return output;
    }

    protected convertToResults(array: string[][]): Record<string, DragAndDropResultDetail> {
        const output: Record<string, DragAndDropResultDetail> = {};
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

    async fetchAll(page: Page, resultId: string): Promise<Record<string, DragAndDropResultDetail>> {
        const url = [URL.DragAndDropResultPrefix, resultId].join("/");
        await page.goto(url);
        const array = await this.parseHTML(page);
        const output = this.convertToResults(array);
        return output;
    }
}

export { DragAndDropResult };
