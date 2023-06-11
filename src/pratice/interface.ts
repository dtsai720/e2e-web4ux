import { Page } from "@playwright/test";
import { Participant } from "../project/interface";

interface ClickEvent {
    X: number;
    Y: number;
    Timestamp: number;
}
interface WinfittsPraticeDetails {
    Account: string;
    Details: {
        Start: ClickEvent;
        Target: ClickEvent;
        Else: ClickEvent[];
        Width: number;
        IsFailed: boolean;
        Distance: number;
    }[];
}
interface DragAndDropEvent {
    EventType: string;
    DragSide: string;
}
interface DragAndDropPraticeResult {
    FileIndex: string;
    IsPassed: boolean;
    Events: DragAndDropEvent[];
}
interface DragAndDropPraticeDetails {
    Account: string;
    Details: DragAndDropPraticeResult[][];
}
type startOne = WinfittsPraticeDetails | DragAndDropPraticeDetails;

interface IPratice {
    startOne(p: Page, deviceId: string, account: string): Promise<startOne>;
    start(p: Page, id: string, users: Participant[]): Promise<Record<string, startOne>>;
}

export {
    ClickEvent,
    WinfittsPraticeDetails,
    IPratice,
    DragAndDropEvent,
    DragAndDropPraticeDetails,
    DragAndDropPraticeResult,
};
