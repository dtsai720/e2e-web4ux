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
interface TypingPraticeResult {
    Event: string;
    Details: string[];
}
interface TypingPraticeDetails {
    Account: string;
    CorrectChars: number;
    WrongChars: number;
    TypingTime: number;
    Details: TypingPraticeResult[];
}
type startOne = WinfittsPraticeDetails | DragAndDropPraticeDetails | TypingPraticeDetails;
type response = Promise<Record<string, Record<string, startOne>>>;

interface IPratice {
    start(p: Page, devices: Device[], users: Participant[]): response;
}

export {
    startOne,
    TypingPraticeDetails,
    TypingPraticeResult,
    ClickEvent,
    WinfittsPraticeDetails,
    IPratice,
    DragAndDropEvent,
    DragAndDropPraticeDetails,
    DragAndDropPraticeResult,
};
