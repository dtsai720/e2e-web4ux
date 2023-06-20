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
import { TypingPraticeDetails, TypingPraticeResult } from "../src/pratice/interface";
import { TypingFetchOne } from "../src/rawdata/interface";

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

interface mapping {
    DoubleClickCount: number;
    GesturesCount: number;
    WordSelectCount: number;
    CusorMoveCount: number;
    ClickCount: number;
    CorrectChars: number;
    WrongChars: number;
    TotalTypingTime: number;
}

const TypingEvent = {
    MouseMove: "Mouse move",
    WordSelected: "Select",
    Click: "Click",
    DoubleClick: "Double click",
    Gestures: "Mouse wheel",
} as const;

const normalizePratice = (Pratice: Record<string, Record<string, TypingPraticeDetails>>) => {
    const output: Record<string, mapping> = {};
    for (const account in Pratice) {
        for (const device in Pratice[account]) {
            if (output[device] === undefined)
                output[device] = {
                    DoubleClickCount: 0,
                    GesturesCount: 0,
                    WordSelectCount: 0,
                    CusorMoveCount: 0,
                    ClickCount: 0,
                    CorrectChars: 0,
                    WrongChars: 0,
                    TotalTypingTime: 0,
                };

            const pratices = Pratice[account][device];
            output[device].CorrectChars += pratices.CorrectChars;
            output[device].WrongChars += pratices.WrongChars;
            output[device].TotalTypingTime += pratices.TypingTime;

            for (let i = 0; i < pratices.Details.length; i++) {
                const data = pratices.Details[i].Event;
                if (data.includes(TypingEvent.DoubleClick)) output[device].DoubleClickCount++;
                else if (data.includes(TypingEvent.Click)) output[device].ClickCount++;
                else if (data.includes(TypingEvent.Gestures)) output[device].GesturesCount++;
                else if (data.includes(TypingEvent.MouseMove)) output[device].CusorMoveCount++;
                else if (data.includes(TypingEvent.WordSelected)) output[device].WordSelectCount++;
            }
        }
    }
    return output;
};

test("Typing", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Results, Summary } = await prepare(page, context);

    for (const account in Pratice) {
        logger(`Typing: Account: ${account}.`);
        expect(RawData[account]).not.toEqual(undefined);
        for (const device in Pratice[account]) {
            logger(`Typing: Device: ${device}.`);
            expect(RawData[account][device]).not.toEqual(undefined);
            // // TODO: Validate WPM
            const pratices = Pratice[account][device];
            const data = RawData[account][device];
            comparePraticeAndRawData(pratices.Details, data);

            logger(`Typing: Device: ${device}.`);
            expect(Results[account][device]).not.toEqual(undefined);
            expect(Results[account][device].length).toEqual(1);
            const results = Results[account][device][0];
            if (!("WPM" in results)) throw new Error("");
            expect(pratices.CorrectChars).toEqual(results.CorrectChars);
            expect(pratices.WrongChars).toEqual(results.WrongChars);
            // TODO: count form pratices
        }
    }

    const nrd = normalizePratice(Pratice);
    expect(Object.keys(nrd)).toEqual(Object.keys(Summary));
    for (const device in nrd) {
        logger(`Typing: Device: ${device}.`);
        expect(Summary[device]).not.toEqual(undefined);
        const summary = Summary[device];
        if (!("GesturesCount" in summary)) throw new Error("");
        const data = nrd[device];
        // expect(summary.ClickCount*Settings.ParticipantCount).toEqual(data.ClickCount)
        expect(summary.DoubleClickCount * Settings.ParticipantCount).toEqual(data.DoubleClickCount);
        expect(summary.GesturesCount * Settings.ParticipantCount).toEqual(data.GesturesCount);
        expect(summary.WordSelectCount * Settings.ParticipantCount).toEqual(data.WordSelectCount);
        // expect(summary.CursorMoveCount*Settings.ParticipantCount).toEqual(data.CusorMoveCount)
        const accuracy = data.CorrectChars / (data.CorrectChars + data.WrongChars);
        expect(Math.round(accuracy * 100)).toEqual(summary.Accuracy);
    }
});
