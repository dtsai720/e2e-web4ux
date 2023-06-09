import { Locator } from "@playwright/test";

import { URL } from "../http/constants";
import { IRawData } from "../rawdata/interface";

class DragAndDropRawData extends IRawData {
    constructor(id: string) {
        super();
        this.url = [URL.DragAndDropRawDataPrefix, id].join("/");
    }

    protected toCanonicalHead(array: ReadonlyArray<string>) {
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            DragSide: array[4],
            NumberOfMove: array[5],
            EventTime: Number(array[6]),
        } as const;
    }

    protected toCanonicalDetail(array: string[]) {
        return {
            Index: array[0],
            EventType: array[1],
            PositionType: array[4],
            EventTime: Number(array[5]),
        } as const;
    }

    protected toCanonicalTitle(array: ReadonlyArray<string>) {
        return {
            FileIndex: array[0],
            IsPassed: array[1] === "True",
            EventTime: Number(array[3]),
        } as const;
    }

    protected async fetchOne(row: Locator) {
        const participant = await this.head(row);
        return {
            Account: participant.Account,
            ModelName: participant.ModelName,
            DeviceName: participant.DeviceName,
            DragSide: participant.DragSide,
            NumberOfMove: participant.NumberOfMove,
            EventTime: participant.EventTime,
            Result: await this.result(row),
        } as const;
    }
}

export { DragAndDropRawData };
