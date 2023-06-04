import { Page } from "@playwright/test";

import { CreateProjectRequest, Participant } from "../project/interface";

interface IPratice {
    setup(page: Page, request: CreateProjectRequest);
    participants(page: Page);
    ResultId(): string;
    pratice(page: Page, p: ReadonlyArray<Participant>);
}

export { IPratice };
