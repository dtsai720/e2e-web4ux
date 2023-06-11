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
interface WinfittsDetail extends ClickEvent {
    EventType: string;
}
interface DragAndDropDetail {
    Index: string;
    EventType: string;
    DragSide: string;
    EventTime: number;
}
interface WinfittsRawDataResult {
    Title: WinfittsTitle;
    Detail: WinfittsDetail[];
}
interface DragAndDropRawDataResult {
    Title: DragAndDropTitle;
    Detail: DragAndDropDetail[];
}
interface WinfittsFetchOne extends Head, EventTime {
    ErrorRate: string;
    Results: WinfittsRawDataResult[];
}
interface DragAndDropFetchOne extends Head, EventTime {
    DragSide: string;
    NumberOfMove: string;
    Result: DragAndDropRawDataResult[];
}
type fetchAll = WinfittsFetchOne | DragAndDropFetchOne[];

interface IRawData {
    fetchAll(page: Page, resultId: string): Promise<Record<string, fetchAll>>;
}

export {
    WinfittsHead,
    DragAndDropHead,
    WinfittsTitle,
    DragAndDropTitle,
    WinfittsDetail,
    DragAndDropDetail,
    WinfittsRawDataResult,
    DragAndDropRawDataResult,
    WinfittsFetchOne,
    DragAndDropFetchOne,
    IRawData,
};
