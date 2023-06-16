import { Page } from "@playwright/test";

interface Summary {
    ModelName: string;
    DeviceName: string;
}
interface WinfittsResultBase {
    Width: number;
    Distance: number;
    CursorMovementTime: number;
    ErrorRate: number;
}
interface WinfittsResultSummary extends Summary, WinfittsResultBase {}
interface WinfittsResultDetail extends WinfittsResultBase {
    Account: string;
}
interface DragAndDropResultBase {
    ArrowTo: string;
    InFolder: number;
    InDesktop: number;
    Overshot: number;
    DoubleClick: number;
    ErrorRate: number;
}
interface DragAndDropResultDetail extends DragAndDropResultBase {
    Account: string;
}
interface DragAndDropResultSummary extends Summary, DragAndDropResultBase {}
type detail = WinfittsResultDetail | DragAndDropResultDetail;
type summary = WinfittsResultSummary | DragAndDropResultSummary;
interface IResult {
    results(page: Page, resultId: string): Promise<Record<string, Record<string, detail[]>>>;
    summary(page: Page, resultId: string): Promise<Record<string, summary>>;
}

export {
    summary,
    detail,
    WinfittsResultSummary,
    DragAndDropResultSummary,
    WinfittsResultDetail,
    DragAndDropResultDetail,
    IResult,
};
