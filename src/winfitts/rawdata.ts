import { Locator } from "@playwright/test";

import { URL } from "../http/constants";
import { IRawData } from "../rawdata/interface";

class WinfittsRawData extends IRawData {
    constructor(id: string) {
        super();
        this.url = [URL.WinfittsRawDataPrefix, id].join("/");
    }

    protected toCanonicalHead(array: ReadonlyArray<string>) {
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            ErrorRate: array[4],
            EventTime: Number(array[5]),
        } as const;
    }

    protected toCanonicalTitle(array: ReadonlyArray<string>) {
        return {
            TrailNumber: Number(array[0]),
            IsFailed: array[1] === "Yes",
            ErrorTime: Number(array[2]),
            Width: Number(array[3]),
            Distance: Number(array[4]),
            Id: Number(array[5]),
            Angle: Number(array[6]),
            EventTime: Number(array[7]),
        } as const;
    }

    protected toCanonicalDetail(array: string[]) {
        array[1] = array[1].slice(1, -1);
        const position = array[1].split(",");
        return {
            EventType: array[0],
            X: Number(position[0].trim()),
            Y: Number(position[1].trim()),
            Timestamp: Number(array[2]),
        } as const;
    }

    protected async fetchOne(row: Locator) {
        const participant = await this.head(row);
        return {
            Account: participant.Account,
            DeviceName: participant.DeviceName,
            ModelName: participant.ModelName,
            ErrorRate: participant.ErrorRate,
            EventTime: participant.EventTime,
            Results: await this.result(row),
        } as const;
    }
}

export { WinfittsRawData };
