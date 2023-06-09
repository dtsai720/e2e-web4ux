import { Page } from "@playwright/test";

import { CreateProjectRequest, Participant } from "../project/interface";
import { PraticeResult } from "../project/interface";

interface IPratice {
    setup(page: Page, request: CreateProjectRequest): Promise<void>;
    participants(page: Page): Promise<ReadonlyArray<Participant>>;
    ResultId(): string;
    pratice(page: Page, p: ReadonlyArray<Participant>): Promise<ReadonlyArray<PraticeResult>>;
}

export { IPratice };
