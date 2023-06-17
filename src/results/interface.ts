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
interface TypingBase {
    WPM: number;
    Accuracy: number;
    ClickCount: number;
    DoubleClickCount: number;
    WordSelectCount: number;
    CursorMoveCount: number;
    GesturesCount: number;
}
interface TypingResultDetail extends TypingBase {
    Account: string;
    TotalChars: number;
    CorrectChars: number;
    WrongChars: number;
    EventTime: number;
}
interface TypingSummary extends Summary, TypingBase {}
interface DragAndDropResultSummary extends Summary, DragAndDropResultBase {}
type detail = WinfittsResultDetail | DragAndDropResultDetail | TypingResultDetail;
type summary = WinfittsResultSummary | DragAndDropResultSummary | TypingSummary;
interface IResult {
    results(page: Page, resultId: string): Promise<Record<string, Record<string, detail[]>>>;
    summary(page: Page, resultId: string): Promise<Record<string, summary>>;
}

export {
    summary,
    detail,
    WinfittsResultSummary,
    DragAndDropResultSummary,
    TypingSummary,
    WinfittsResultDetail,
    DragAndDropResultDetail,
    TypingResultDetail,
    IResult,
};
