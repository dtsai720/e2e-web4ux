interface WinfittsHead {
    Account: string;
    ModelName: string;
    DeviceName: string;
    ErrorRate: string;
    EventTime: number;
}
interface DragAndDropHead {
    Account: string;
}
interface WinfittsTitle {
    TrailNumber: number;
    IsFailed: boolean;
    ErrorTime: number;
    Width: number;
    Distance: number;
    Id: number;
    Angle: number;
    EventTime: number;
}
interface DragAndDropTitle {
    TrailNumber: number;
}
interface WinfittsDetail {
    EventType: string;
    X: number;
    Y: number;
    Timestamp: number;
}
interface DragAndDropDetail {
    EventType: string;
}
interface WinfittsResult {
    Title: WinfittsTitle;
    Detail: WinfittsDetail[];
}
interface DragAndDropResult {
    Title: DragAndDropTitle;
    Detail: DragAndDropDetail[];
}
interface WinfittsFetchOne {
    Account: string;
    DeviceName: string;
    ModelName: string;
    ErrorRate: string;
    EventTime: number;
    Results: WinfittsResult[];
}
interface DragAndDropFetchOne {
    Account: string;
}

export {
    WinfittsHead,
    DragAndDropHead,
    WinfittsTitle,
    DragAndDropTitle,
    WinfittsDetail,
    DragAndDropDetail,
    WinfittsResult,
    DragAndDropResult,
    WinfittsFetchOne,
    DragAndDropFetchOne,
};
