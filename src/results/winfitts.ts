import { Result } from "./prototype";
import { IResult, WinfittsResultDetail, WinfittsResultSummary } from "./interface";
import { URL } from "../http/constants";

class WinfittsResult extends Result implements IResult {
    protected urlPrefix = URL.WinfittsResultPrefix;
    protected detailLength = 6;
    protected summaryLength = 6;
    protected toCanonicalSummaryDetail(candidate: string[]): WinfittsResultSummary {
        if (candidate.length !== this.summaryLength) throw new Error("");
        const ModelName = candidate[0];
        const DeviceName = candidate[1];
        const wd = candidate[3].split("/");
        const Width = Number(wd[0]);
        const Distance = Number(wd[1]);
        const CursorMovementTime = Number(candidate[4]);
        const errorRate = candidate[5].replace("%", "").trim();
        const ErrorRate = Number(errorRate);
        return { ModelName, DeviceName, Width, Distance, CursorMovementTime, ErrorRate };
    }

    protected toCanonicalSummaryKey(candidate: string[]): string {
        if (candidate.length !== this.summaryLength) throw new Error("");
        const ModelName = candidate[0];
        const DeviceName = candidate[1];
        const wd = candidate[3].split("/");
        const Width = Number(wd[0]);
        const Distance = Number(wd[1]);
        return [ModelName, DeviceName, Width.toString(), Distance.toString()].join("-");
    }

    protected toCanonicalResults(array: string[], Account: string): WinfittsResultDetail {
        const wd = array[1].split("/");
        const Width = Number(wd[0]);
        const Distance = Number(wd[1]);
        const CursorMovementTime = Number(array[2]);
        const text = array[3].replace("%", "").trim();
        const ErrorRate = Number(text);
        return { Account, Width, Distance, CursorMovementTime, ErrorRate };
    }
}

export { WinfittsResult };
