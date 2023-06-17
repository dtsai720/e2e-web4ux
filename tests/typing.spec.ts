import { test, Page, BrowserContext } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { TypingProject } from "../src/project/typing";
import { TypingPratice } from "../src/pratice/typing";
import { TypingRawData } from "../src/rawdata/typing";
import { TypingResult } from "../src/results/typing";

const prepare = async (page: Page, context: BrowserContext) => {
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName("Typing", "");
    const request = {
        ProjectName: projectName,
        ParticipantCount: Settings.ParticipantCount,
        DeviceCount: Settings.DeviceCount,
    } as const;
    const project = new TypingProject(token, cookie);
    const details = await project.setup(page, request);
    const participants = await project.participant(
        page,
        details.Detail.ProjectId,
        request.ParticipantCount
    );
    const devices = await project.device(page, details.Detail.ProjectId);
    const tp = new TypingPratice();
    const Pratice = await tp.start(page, devices, participants);
    const trd = new TypingRawData();
    const RawData = await trd.fetchAll(page, details.Detail.ResultId);
    const ddr = new TypingResult();
    const Results = await ddr.results(page, details.Detail.ResultId);
    const Summary = await ddr.summary(page, details.Detail.ResultId);
    return { Pratice, RawData, Results, Summary };
};

test("Typing", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Results, Summary } = await prepare(page, context);
});
