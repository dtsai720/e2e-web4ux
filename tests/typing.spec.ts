import { test, Page, BrowserContext, expect } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { TypingProject } from "../src/project/typing";
import { TypingPratice } from "../src/pratice/typing";
import { TypingRawData } from "../src/rawdata/typing";
import { TypingResult } from "../src/results/typing";
import { logger } from "../src/logger";
import { TypingPraticeResult } from "../src/pratice/interface";
import { TypingDetail, TypingFetchOne } from "../src/rawdata/interface";

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

const comparePraticeAndRawData = (pratices: TypingPraticeResult[], rawdata: TypingFetchOne) => {
    expect(rawdata.Results.length).toEqual(1);
    const data = rawdata.Results[0].Detail;
    expect(pratices.length).toBeLessThanOrEqual(data.length);
    let idx = 0;
    for (let i = 0; i < pratices.length; i++) {
        const pratice = pratices[i];
        while (idx < data.length && data[idx].Event != pratice.Event) idx++;
        expect(idx).toBeLessThan(data.length);
        expect(pratice.Event).toEqual(data[idx].Event);
        idx++;
    }
    expect(idx).toEqual(data.length);
};

const praticesToResults = (pratices: TypingPraticeResult[]) => {
    // let ClickCount = 0
    // let DoubleClickCount = 0
    // let WordSelectCount = 0
    // let CursorMoveCount = 0
    // let GesturesCount = 0
    // const array = [...pratices]
};

test("Typing", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Results, Summary } = await prepare(page, context);

    for (const account in Pratice) {
        logger(`Typing: Account: ${account}, Compare Pratice And RawData.`);
        expect(RawData[account]).not.toEqual(undefined);
        for (const device in Pratice[account]) {
            logger(`Typing: Device: ${device}, Compare Pratice And RawData.`);
            expect(RawData[account][device]).not.toEqual(undefined);
            // // TODO: Validate WPM
            const pratices = Pratice[account][device];
            const data = RawData[account][device];
            comparePraticeAndRawData(pratices.Details, data);

            logger(`Typing: Device: ${device}, Compare Pratice And Results.`);
            expect(Results[account][device]).not.toEqual(undefined);
            expect(Results[account][device].length).toEqual(1);
            const results = Results[account][device][0];
            if (!("WPM" in results)) throw new Error("");
            expect(pratices.CorrectChars).toEqual(results.CorrectChars);
            expect(pratices.WrongChars).toEqual(results.WrongChars);

            // TODO: count form pratices
        }
    }
});
