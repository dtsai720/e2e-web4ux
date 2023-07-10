import { URL } from "../http/constants";
import { TypingResultDetail, TypingSummary } from "./interface";
import { Result } from "./prototype";

class TypingResult extends Result {
    protected urlPrefix = URL.TypingResultPrefix;
    protected detailLength = 12;
    protected summaryLength = 9;
    protected toCanonicalResults(array: string[], Account: string): TypingResultDetail {
        const correct = array[0].split("/");
        const wrong = array[1].split("/");
        return {
            Account: Account,
            TotalChars: Number(correct[1]),
            CorrectChars: Number(correct[0]),
            WrongChars: Number(wrong[0]),
            WPM: Number(array[2]),
            Accuracy: Number(array[3].replace("%", "").trim()),
            TypingTime: Number(array[4]),
            ClickCount: Number(array[5]),
            DoubleClickCount: Number(array[6]),
            WordSelectCount: Number(array[7]),
            CursorMoveCount: Number(array[8]),
            GesturesCount: Number(array[9]),
        } as const;
    }

    protected toCanonicalSummaryKey(candidate: string[]) {
        if (candidate.length !== this.summaryLength) throw new Error("");
        const ModelName = candidate[0];
        const DeviceName = candidate[1];
        return `${ModelName}-${DeviceName}`;
    }

    protected toCanonicalSummaryDetail(candidate: string[]): TypingSummary {
        if (candidate.length !== this.summaryLength) throw new Error("");
        return {
            ModelName: candidate[0],
            DeviceName: candidate[1],
            WPM: Number(candidate[2]),
            Accuracy: Number(candidate[3].replace("%", "").trim()),
            ClickCount: Number(candidate[4]),
            DoubleClickCount: Number(candidate[5]),
            WordSelectCount: Number(candidate[6]),
            CursorMoveCount: Number(candidate[7]),
            GesturesCount: Number(candidate[8]),
        };
    }
}

export { TypingResult };
