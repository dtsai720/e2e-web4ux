import { Page } from "@playwright/test";
import { Participant } from "../project/interface";

interface ClickEvent {
    X: number;
    Y: number;
    Timestamp: number;
}
interface WinfittsDetails {
    Account: string;
    Details: {
        Start: ClickEvent;
        Target: ClickEvent;
        Else: ClickEvent | null;
        Width: number;
        Distance: number;
    }[];
}
interface DragAndDropEvent {
    EventType: string;
    DragSide: string;
}
interface DragAndDropResult {
    FileIndex: string;
    IsPassed: boolean;
    Events: DragAndDropEvent[];
}
interface DragAndDropDetails {
    Account: string;
    ArrowToRight: DragAndDropResult[];
    ArrowToLeft: DragAndDropResult[];
}
interface IPratice {
    startOne(
        p: Page,
        deviceId: string,
        account: string
    ): Promise<WinfittsDetails | DragAndDropDetails>;
    start(
        p: Page,
        deviceId: string,
        participants: Participant[]
    ): Promise<Record<string, WinfittsDetails | DragAndDropDetails>>;
}

export {
    ClickEvent,
    WinfittsDetails,
    IPratice,
    DragAndDropEvent,
    DragAndDropDetails,
    DragAndDropResult,
};
