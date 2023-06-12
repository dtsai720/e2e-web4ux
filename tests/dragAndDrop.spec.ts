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
import { DragAndDropResultRow } from "../src/results/interface";

const prepare = async (page: Page, context: BrowserContext) => {
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
    const ddp = new DragAndDropPratices();
    const Pratice = await ddp.start(page, device.Id, participants);
    const ddrd = new DragAndDropRawData();
    const RawData = await ddrd.fetchAll(page, details.Detail.ResultId);
    const ddr = new DragAndDropResult();
    const Results = await ddr.fetchAll(page, details.Detail.ResultId);
    return { Pratice, RawData, Results };
};

const comparePraticeAndRawData = (
    pratices: DragAndDropPraticeResult[],
    rawdata: DragAndDropFetchOne
) => {
    expect(pratices.length).toEqual(rawdata.Result.length);
    let EventTime = 0;
    for (let i = 0; i < pratices.length; i++) {
        logger(`DragAndDrop: Compare file${i}`);
        const pratice = pratices[i];
        const data = rawdata.Result[i];
        expect(pratice.Events.length === 1).toEqual(pratice.IsPassed);
        expect(pratice.IsPassed).toEqual(data.Title.IsPassed);
        expect(pratice.FileIndex).toEqual(data.Title.FileIndex);
        expect(pratice.Events.length).toBeLessThanOrEqual(data.Detail.length);

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

const compareRawDataAndResult = (rawdata: DragAndDropFetchOne, result: DragAndDropResultRow) => {
    const data = convertToResult(rawdata);
    expect(rawdata.DragSide.toLowerCase()).toEqual(result.ArrowTo.toLowerCase());
    expect(data.DoubleClick).toEqual(result.DoubleClick);
    expect(data.InDesktop).toEqual(result.InDesktop);
    expect(data.InFolder).toEqual(result.InFolder);
    expect(data.Overshot).toEqual(result.Overshot);
    expect(data.TotalErrorCount).toEqual(result.ErrorRate * TotalFileCount);
};

test.skip("Drag And Drop", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Results } = await prepare(page, context);

    expect(Object.keys(Pratice).length).toEqual(Object.keys(RawData).length);
    for (const key in Pratice) {
        logger(`DragAndDrop: Account: ${key}, Compare Pratice And RawData.`);
        expect(RawData[key]).not.toEqual(undefined);
        expect(RawData[key].length).toEqual(2);
        expect(Pratice[key].Account).toEqual(key);
        expect(Pratice[key].Details.length).toEqual(RawData[key].length);
        for (let i = 0; i < 2; i++) {
            const ArrowTo = i === 0 ? "LeftToRight" : "RightToLeft";
            logger(`DragAndDrop: Compare ${ArrowTo}`);
            expect(RawData[key][i].Account).toEqual(key);
            expect(RawData[key][i].ModelName).toEqual(Settings.ModelName);
            expect(RawData[key][i].DeviceName).toEqual(Settings.DeviceName);
            comparePraticeAndRawData(Pratice[key].Details[i], RawData[key][i]);
        }
    }

    expect(Object.keys(RawData).length).toEqual(Object.keys(Results).length);
    for (const key in RawData) {
        logger(`DragAndDrop: Account: ${key}, Compare RawData And Result.`);
        expect(Results[key]).not.toEqual(undefined);
        expect(Results[key].Account).toEqual(key);
        expect(RawData[key].length).toEqual(Results[key].Details.length);
        for (let i = 0; i < RawData[key].length; i++) {
            compareRawDataAndResult(RawData[key][i], Results[key].Details[i]);
        }
    }
});
