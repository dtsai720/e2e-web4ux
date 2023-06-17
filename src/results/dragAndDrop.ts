import { Result } from "./prototype";
import { URL } from "../http/constants";
import { DragAndDropResultDetail, DragAndDropResultSummary, IResult } from "./interface";

class DragAndDropResult extends Result implements IResult {
    protected urlPrefix = URL.DragAndDropResultPrefix;
    protected detailLength = 12;
    protected toCanonicalResults(array: string[], Account: string): DragAndDropResultDetail {
        return {
            Account: Account,
            ArrowTo: array[0].toLowerCase(),
            InFolder: Number(array[1]),
            InDesktop: Number(array[2]),
            Overshot: Number(array[3]),
            DoubleClick: Number(array[4]),
            ErrorRate: Number(array[5].replace("%", "").trim()),
        };
    }

    protected toCanonicalSummaryDetail(candidate: string[]): DragAndDropResultSummary {
        if (candidate.length !== this.detailLength) throw new Error("");
        return {
            ModelName: candidate[0],
            DeviceName: candidate[1],
            ArrowTo: candidate[2].toLocaleLowerCase(),
            ErrorRate: Number(candidate[3].replace("%", "").trim()),
            InFolder: Number(candidate[4]),
            InDesktop: Number(candidate[5]),
            Overshot: Number(candidate[6]),
            DoubleClick: Number(candidate[7]),
        };
    }

    protected toCanonicalSummaryKey(candidate: string[]): string {
        if (candidate.length !== this.detailLength) throw new Error("");
        const ModelName = candidate[0];
        const DeviceName = candidate[1];
        const ArrowTo = candidate[2].toLowerCase();
        return [ModelName, DeviceName, ArrowTo].join("-");
    }
}

export { DragAndDropResult };
