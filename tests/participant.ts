import { Page } from "@playwright/test";

import { URL } from "./config";

interface Participant {
    Id: string;
    Account: string;
}

const ParticipantDetail = async (
    page: Page,
    projectId: string,
    participantCount: number
): Promise<Array<Participant>> => {
    await page.goto([URL.FetchParticipantPrefix, projectId].join("/"));
    await page.waitForSelector("table");
    const output: Array<Participant> = [];
    for (let i = 0; i < participantCount; i++) {
        const Id =
            (await page.locator(`input[name=\"Participants[${i}].Id\"]`).getAttribute("value")) ||
            "";
        const Account =
            (await page
                .locator(`input[name=\"Participants[${i}].Account\"]`)
                .getAttribute("value")) || "";
        output.push({ Id, Account });
    }
    return output;
};

export { ParticipantDetail, Participant };
