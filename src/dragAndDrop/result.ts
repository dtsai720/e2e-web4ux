import { Page } from "@playwright/test";

import { URL } from "../http/constants";

class DragAndDropResult {
    private url: string;
    constructor(id: string) {
        this.url = [URL.DragAndDropResultPrefix, id].join("/");
    }

    async fetch(page: Page) {
        await page.goto(this.url);
        return;
    }
}

export { DragAndDropResult };
