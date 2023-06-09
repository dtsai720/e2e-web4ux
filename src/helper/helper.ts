import { Page, BrowserContext } from "@playwright/test";

import { Settings } from "../config";
import { Token } from "../http/csrf";
import { Cookies } from "../http/cookies";
import { NewProjectName } from "../project/project";

interface Name {
    Prefix: string;
    Postfix: string;
}

const CreateProjectRequirements = async (page: Page, context: BrowserContext, name: Name) => {
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName(name.Prefix, name.Postfix);
    const request = {
        ProjectName: projectName,
        ModelName: Settings.ModelName,
        DeviceName: Settings.DeviceName,
        ParticipantCount: Settings.ParticipantCount,
    } as const;
    return { Token: token, Cookie: cookie, Request: request } as const;
};

export { CreateProjectRequirements };
