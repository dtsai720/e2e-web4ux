import { Page } from "@playwright/test";

interface WinfittsResultRow {
    Id: number;
    Width: number;
    Distance: number;
    CursorMovementTime: number;
    ErrorRate: number;
}
interface DragAndDropResultRow {
    ArrowTo: string;
    InFolder: number;
    InDesktop: number;
    Overshot: number;
    DoubleClick: number;
    ErrorRate: number;
}
interface WinfittsResultDetail {
    Account: string;
    Details: WinfittsResultRow[];
}
interface DragAndDropResultDetail {
    Account: string;
    Details: DragAndDropResultRow[];
}
type detail = WinfittsResultDetail | DragAndDropResultDetail;
interface IResult {
    fetchAll(page: Page, resultId: string): Promise<Record<string, detail>>;
}

export {
    WinfittsResultRow,
    DragAndDropResultRow,
    WinfittsResultDetail,
    DragAndDropResultDetail,
    IResult,
};
