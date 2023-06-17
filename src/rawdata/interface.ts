import { Page } from "@playwright/test";

import { ClickEvent } from "../pratice/interface";

interface EventTime {
    EventTime: number;
}
interface Head {
    Account: string;
    ModelName: string;
    DeviceName: string;
}
interface WinfittsHead extends Head, EventTime {
    ErrorRate: string;
}
interface DragAndDropHead extends Head, EventTime {
    DragSide: string;
    NumberOfMove: string;
}
interface TypingHead extends Head, EventTime {
    Accuracy: number;
    WPM: number;
    TypingTime: number;
}
interface WinfittsTitle extends EventTime {
    TrailNumber: number;
    IsFailed: boolean;
    ErrorTime: number;
    Width: number;
    Distance: number;
    Id: number;
    Angle: number;
}
interface DragAndDropTitle extends EventTime {
    FileIndex: string;
    IsPassed: boolean;
}
interface TypingTitle {
    Event: string;
    Details: string[];
}
interface WinfittsDetail extends ClickEvent {
    EventType: string;
}
interface DragAndDropDetail {
    Index: string;
    EventType: string;
    DragSide: string;
    EventTime: number;
}
interface TypingDetail {
    Event: string;
    Details: string[];
}
interface WinfittsRawDataResult {
    Title: WinfittsTitle;
    Detail: WinfittsDetail[];
}
interface DragAndDropRawDataResult {
    Title: DragAndDropTitle;
    Detail: DragAndDropDetail[];
}
interface TypingResult {
    Detail: TypingDetail[];
}
interface WinfittsFetchOne extends Head, EventTime {
    ErrorRate: string;
    Results: WinfittsRawDataResult[];
}
interface DragAndDropFetchOne extends Head, EventTime {
    ArrowTo: string;
    NumberOfMove: string;
    Results: DragAndDropRawDataResult[];
}
interface TypingFetchOne extends TypingHead {
    Results: TypingResult[];
}
type fetchAll = Record<
    string,
    Record<string, WinfittsFetchOne | DragAndDropFetchOne[] | TypingFetchOne>
>;
interface IRawData {
    fetchAll(page: Page, resultId: string): Promise<fetchAll>;
}

export {
    fetchAll,
    TypingHead,
    WinfittsHead,
    TypingTitle,
    TypingResult,
    DragAndDropHead,
    WinfittsTitle,
    DragAndDropTitle,
    WinfittsDetail,
    DragAndDropDetail,
    TypingDetail,
    WinfittsRawDataResult,
    DragAndDropRawDataResult,
    WinfittsFetchOne,
    DragAndDropFetchOne,
    TypingFetchOne,
    IRawData,
};
