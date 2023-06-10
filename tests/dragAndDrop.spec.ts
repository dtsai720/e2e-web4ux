import { test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { DragAndDropProject } from "../src/project/dragAndDrop";
import { DragAndDorpPratices } from "../src/pratice/dragAndDrop";

test.skip("Drag And Drop", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName("DragAndDrop", "");
    const request = {
        ProjectName: projectName,
        ModelName: Settings.ModelName,
        DeviceName: Settings.DeviceName,
        ParticipantCount: Settings.ParticipantCount,
    } as const;
    const project = new DragAndDropProject(token, cookie);
    const details = await project.setup(page, request);
    const participants = await project.participant(
        page,
        details.Detail.ProjectId,
        request.ParticipantCount
    );
    const device = await project.device(page, details.Detail.ProjectId);
    const pratice = new DragAndDorpPratices();
    const output = await pratice.start(page, device.Id, participants);
    // console.log(JSON.stringify(output))
});
