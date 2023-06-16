import { test, Page, BrowserContext, expect } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { DragAndDropProject } from "../src/project/dragAndDrop";
import { DragAndDropPratices, TotalFileCount } from "../src/pratice/dragAndDrop";
import { DragAndDropRawData } from "../src/rawdata/dragAndDrop";
import { logger } from "../src/logger";
import { DragAndDropPraticeResult } from "../src/pratice/interface";
import { DragAndDropFetchOne } from "../src/rawdata/interface";
import { DragAndDropResult } from "../src/results/dragAndDrop";
import { detail } from "../src/results/interface";

const prepare = async (page: Page, context: BrowserContext) => {
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName("DragAndDrop", "");
    const request = {
        ProjectName: projectName,
        ParticipantCount: Settings.ParticipantCount,
        DeviceCount: Settings.DeviceCount,
    } as const;
    const project = new DragAndDropProject(token, cookie);
    const details = await project.setup(page, request);
    const participants = await project.participant(
        page,
        details.Detail.ProjectId,
        request.ParticipantCount
    );
    const devices = await project.device(page, details.Detail.ProjectId);
    const ddp = new DragAndDropPratices();
    const Pratice = await ddp.start(page, devices, participants);
    const ddrd = new DragAndDropRawData();
    const RawData = await ddrd.fetchAll(page, details.Detail.ResultId);
    const ddr = new DragAndDropResult();
    const Summary = await ddr.summary(page, details.Detail.ResultId);
    const Results = await ddr.results(page, details.Detail.ResultId);
    return { Pratice, RawData, Results, Summary };
};

const comparePraticeAndRawData = (
    pratices: DragAndDropPraticeResult[],
    rawdata: DragAndDropFetchOne
) => {
    expect(pratices.length).toEqual(rawdata.Result.length);
    let EventTime = 0;
    // let NumberOfMove = 0
    for (let i = 0; i < pratices.length; i++) {
        logger(`DragAndDrop: Compare file${i}`);
        const pratice = pratices[i];
        const data = rawdata.Result[i];
        expect(pratice.Events.length === 1).toEqual(pratice.IsPassed);
        expect(pratice.IsPassed).toEqual(data.Title.IsPassed);
        expect(pratice.FileIndex).toEqual(data.Title.FileIndex);
        expect(pratice.Events.length).toBeLessThanOrEqual(data.Detail.length);
        // NumberOfMove += pratice.NumberOfMove
        let timestamp = 0;
        for (let j = 1; j <= pratice.Events.length; j++) {
            const source = pratice.Events[pratice.Events.length - j];
            const datum = data.Detail[data.Detail.length - j];
            expect(source).not.toEqual(undefined);
            expect(datum).not.toEqual(undefined);
            expect(source.DragSide).toEqual(datum.DragSide);
            timestamp += datum.EventTime;
        }
        expect(data.Title.EventTime).toEqual(timestamp);
        EventTime += data.Title.EventTime;
    }
    expect(EventTime).toEqual(rawdata.EventTime);
    // expect(`${NumberOfMove}/${TotalFileCount}`).toEqual(rawdata.NumberOfMove)
};

const convertToResult = (rawdata: DragAndDropFetchOne) => {
    const output = {
        InDesktop: 0,
        InFolder: 0,
        Overshot: 0,
        DoubleClick: 0,
        TotalErrorCount: 0,
    };
    for (let i = 0; i < rawdata.Result.length; i++) {
        const data = rawdata.Result[i];
        if (data.Title.IsPassed) continue;
        output.TotalErrorCount++;
        const detail = data.Detail[data.Detail.length - 2];
        if (detail.EventType === "Double click") output.DoubleClick++;
        else if (detail.DragSide === "folder") output.InFolder++;
        else if (detail.DragSide === "desktop") output.InDesktop++;
        else if (detail.DragSide === "overshot") output.Overshot++;
        else throw new Error("Invalid data format");
    }
    return output;
};

const compareRawDataAndResult = (rawdata: DragAndDropFetchOne, result: detail) => {
    if (!("InFolder" in result)) throw new Error("");
    const data = convertToResult(rawdata);
    expect(rawdata.ArrowTo.toLowerCase()).toEqual(result.ArrowTo.toLowerCase());
    expect(data.DoubleClick).toEqual(result.DoubleClick);
    expect(data.InDesktop).toEqual(result.InDesktop);
    expect(data.InFolder).toEqual(result.InFolder);
    expect(data.Overshot).toEqual(result.Overshot);
    expect(data.TotalErrorCount * 100).toEqual(result.ErrorRate * TotalFileCount);
};

interface SimpleSummary {
    InFolder: number;
    InDesktop: number;
    Overshop: number;
    DoubleClick: number;
    ErrorCount: number;
}

const normalizeRawData = (
    rawdata: Record<string, Record<string, DragAndDropFetchOne[]>>
): Record<string, SimpleSummary> => {
    const output: Record<string, SimpleSummary> = {};
    for (const account in rawdata) {
        for (const device in rawdata[account]) {
            for (let i = 0; i < rawdata[account][device].length; i++) {
                const fetchOne = rawdata[account][device][i];
                const key = `${device}-${fetchOne.ArrowTo}`;
                if (output[key] === undefined)
                    output[key] = {
                        InDesktop: 0,
                        InFolder: 0,
                        DoubleClick: 0,
                        Overshop: 0,
                        ErrorCount: 0,
                    };
                for (let j = 0; j < fetchOne.Result.length; j++) {
                    const data = fetchOne.Result[j];
                    if (data.Title.IsPassed) continue;
                    output[key].ErrorCount++;
                    const idx = data.Detail.length - 2;
                    if (data.Detail[idx].EventType === "Double click") output[key].DoubleClick++;
                    else if (data.Detail[idx].DragSide === "folder") output[key].InFolder++;
                    else if (data.Detail[idx].DragSide === "overshot") output[key].Overshop++;
                    else if (data.Detail[idx].DragSide === "desktop") output[key].InDesktop++;
                }
            }
        }
    }
    return output;
};

test("Drag And Drop", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Results, Summary } = await prepare(page, context);

    expect(Object.keys(Pratice).length).toEqual(Object.keys(RawData).length);
    for (const account in Pratice) {
        logger(`DragAndDrop: Account: ${account}, Compare Pratice And RawData.`);
        expect(RawData[account]).not.toEqual(undefined);
        expect(Object.keys(Pratice[account]).length).toEqual(Object.keys(RawData[account]).length);

        for (const key in Pratice[account]) {
            logger(`DragAndDrop: Device: ${key}, Compare Pratice And RawData.`);
            const pratice = Pratice[account][key];
            const data = RawData[account][key];
            expect(data).not.toEqual(undefined);
            expect(pratice.Account).toEqual(account);
            expect(pratice.Details.length).toEqual(2);
            expect(data.length).toEqual(2);

            for (let i = 0; i < 2; i++) {
                const ArrowTo = i === 0 ? "LeftToRight" : "RightToLeft";
                logger(`DragAndDrop: Compare ${ArrowTo}`);
                expect(data[i].Account).toEqual(account);
                comparePraticeAndRawData(pratice.Details[i], data[i]);
            }
        }
    }

    expect(Object.keys(RawData).length).toEqual(Object.keys(Results).length);
    for (const account in RawData) {
        logger(`DragAndDrop: Account: ${account}, Compare RawData And Result.`);
        expect(Results[account]).not.toEqual(undefined);
        for (const device in RawData[account]) {
            logger(`DragAndDrop: Device: ${device}, Compare RawData And Results.`);
            expect(Results[account][device]).not.toEqual(undefined);
            const data = RawData[account][device];
            const result = Results[account][device];
            expect(data.length).toEqual(result.length);
            for (let i = 0; i < data.length; i++) {
                compareRawDataAndResult(data[i], result[i]);
            }
        }
    }

    const nrd = normalizeRawData(RawData);
    expect(Object.keys(nrd).length).toEqual(Object.keys(Summary).length);
    for (const key in nrd) {
        expect(Summary[key]).not.toEqual(undefined);
        const data = nrd[key];
        const summary = Summary[key];
        if (!("InFolder" in summary)) throw new Error("");
        const factor = TotalFileCount * Settings.ParticipantCount;
        expect(data.DoubleClick).toEqual(summary.DoubleClick);
        expect(data.InDesktop).toEqual(summary.InDesktop);
        expect(data.InFolder).toEqual(summary.InFolder);
        expect(data.Overshop).toEqual(summary.Overshot);
        expect(data.ErrorCount * 100).toEqual(summary.ErrorRate * factor);
    }
});
