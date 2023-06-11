import { test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { TypingProject } from "../src/project/typing";

test.skip("Typing", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName("Typing", "");
    const request = {
        ProjectName: projectName,
        ModelName: Settings.ModelName,
        DeviceName: Settings.DeviceName,
        ParticipantCount: Settings.ParticipantCount,
    } as const;
    const project = new TypingProject(token, cookie);
    await project.setup(page, request);
    // await TypingComponents(page, context);
});
