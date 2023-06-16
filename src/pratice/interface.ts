import { Page } from "@playwright/test";
import { Device, Participant } from "../project/interface";

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
    NumberOfMove: number;
    Events: DragAndDropEvent[];
}
interface DragAndDropPraticeDetails {
    Account: string;
    Details: DragAndDropPraticeResult[][];
}
interface TypingPraticeDetails {
    Account: string;
    Details: DragAndDropPraticeResult[][];
}
type startOne = WinfittsPraticeDetails | DragAndDropPraticeDetails | TypingPraticeDetails;
type response = Promise<Record<string, Record<string, startOne>>>;

interface IPratice {
    startOne(p: Page, deviceId: string, account: string): Promise<startOne>;
    start(p: Page, devices: Device[], users: Participant[]): response;
}

export {
    startOne,
    TypingPraticeDetails,
    ClickEvent,
    WinfittsPraticeDetails,
    IPratice,
    DragAndDropEvent,
    DragAndDropPraticeDetails,
    DragAndDropPraticeResult,
};
