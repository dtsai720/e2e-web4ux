import { Page } from "@playwright/test";

import { Participant } from "../project/interface";
import { Pratice } from "../project/pratice";

class DragAndDorpPratices extends Pratice {
    async start(page: Page, participant: Participant) {
        await super.start(page, participant);
    }
}

export { DragAndDorpPratices };
