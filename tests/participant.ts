import { Page } from "@playwright/test";

import { URL, Attribute, Tag } from "./http";

interface Participant {
    Id: string;
    Account: string;
}

const Selector = {
    Id: (num: number): string => {
        return `input[name=\"Participants[${num}].Id\"]`;
    },
    Account: (num: number): string => {
        return `input[name=\"Participants[${num}].Account\"]`;
    },
};

const ParticipantDetail = async (
    page: Page,
    projectId: string,
    participantCount: number
): Promise<Array<Participant>> => {
    await page.goto([URL.FetchParticipantPrefix, projectId].join("/"));
    await page.waitForSelector(Tag.Table);

    const output: Array<Participant> = [];
    for (let i = 0; i < participantCount; i++) {
        output.push({
            Id: (await page.locator(Selector.Id(i)).getAttribute(Attribute.Value)) || "",
            Account: (await page.locator(Selector.Account(i)).getAttribute(Attribute.Value)) || "",
        });
    }
    return output;
};

export { ParticipantDetail, Participant };
