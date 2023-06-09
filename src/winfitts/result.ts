import { URL } from "../http/constants";
import { IResults } from "../result/result";

interface WinfittsResult {
    Id: number;
    Width: number;
    Distance: number;
    CursorMovementTime: number;
    ErrorRate: number;
}

class WinfittsResults extends IResults {
    constructor(id: string, steps: number) {
        super(id, steps);
        this.url = [URL.WinfittsResultPrefix, id].join("/");
    }

    protected toCanonicalResult(array: ReadonlyArray<string[]>, start: number) {
        const output: WinfittsResult[] = [];
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
}

export { WinfittsResults, WinfittsResult };
