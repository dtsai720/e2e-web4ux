import { BrowserContext, Page, expect, test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { WinfittsProject } from "../src/project/winfitts";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { TotalTrailCount, WinfittsPratices } from "../src/pratice/winfitts";
import { WinfittsRawData } from "../src/rawdata/winfitts";
import { WinfittsResult } from "../src/results/winfitts";
import { WinfittsPraticeDetails } from "../src/pratice/interface";
import { WinfittsFetchOne } from "../src/rawdata/interface";
import { logger } from "../src/logger";
import { WinfittsResultDetail } from "../src/results/interface";

const prepare = async (page: Page, context: BrowserContext) => {
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName("Winfitts", "");
    const request = {
        ProjectName: projectName,
        ModelName: Settings.ModelName,
        DeviceName: Settings.DeviceName,
        ParticipantCount: Settings.ParticipantCount,
    } as const;
    const project = new WinfittsProject(token, cookie);
    const details = await project.setup(page, request);
    const participants = await project.participant(
        page,
        details.Detail.ProjectId,
        request.ParticipantCount
    );
    const device = await project.device(page, details.Detail.ProjectId);
    const wp = new WinfittsPratices();
    const Pratice = await wp.start(page, device.Id, participants);
    const wrd = new WinfittsRawData();
    const RawData = await wrd.fetchAll(page, details.Detail.ResultId);
    const wr = new WinfittsResult();
    const Results = await wr.fetchAll(page, details.Detail.ResultId);
    return { Pratice, RawData, Results };
};

const comparePraticeAndRawData = (pratice: WinfittsPraticeDetails, rawdata: WinfittsFetchOne) => {
    let ErrorRate = 0;
    let EventTime = 0;
    for (let i = 0; i < pratice.Details.length; i++) {
        logger(`Winfitts: Current Index is ${i + 1}`);
        const source = pratice.Details[i];
        const data = rawdata.Results[i];
        const results = data.Detail;
        let resultErrorCount = 0;
        while (results.length > 0 && results[0].EventType !== "start") {
            results.shift();
            resultErrorCount++;
        }
        const start = results.shift();
        const target = results.pop();
        resultErrorCount += results.length;
        if (start === undefined || target === undefined) throw new Error("");

        expect(source.Distance).toEqual(data.Title.Distance);
        expect(source.Width).toEqual(data.Title.Width);
        expect(source.Else.length).toEqual(data.Title.ErrorTime);
        expect(resultErrorCount).toEqual(data.Title.ErrorTime);
        expect(target.Timestamp - start.Timestamp).toEqual(data.Title.EventTime);
        expect(source.IsFailed).toEqual(data.Title.IsFailed);

        ErrorRate += data.Title.IsFailed ? 1 : 0;
        EventTime += data.Title.EventTime;
    }
    return { ErrorRate, EventTime };
};

const convertToResult = (rawdata: WinfittsFetchOne) => {
    const output: Record<string, { TotalEventTime: number; ValidErrorCount: number }> = {};
    for (let i = 0; i < rawdata.Results.length; i++) {
        const title = rawdata.Results[i].Title;
        const key = `${title.Width}-${title.Distance}`;
        if (output[key] === undefined) output[key] = { TotalEventTime: 0, ValidErrorCount: 0 };
        output[key].TotalEventTime += title.EventTime;
        output[key].ValidErrorCount += title.IsFailed ? 1 : 0;
    }
    return output;
};

const compareRawDataAndResult = (rawdata: WinfittsFetchOne, results: WinfittsResultDetail) => {
    const data = convertToResult(rawdata);
    expect(results.Details.length).toEqual(Object.keys(data).length);
    const factor = TotalTrailCount / results.Details.length;
    for (let i = 0; i < results.Details.length; i++) {
        const result = results.Details[i];
        logger(`Winfitts: Width: ${result.Width} And Distance: ${result.Distance}`);
        const key = `${result.Width}-${result.Distance}`;
        expect(data[key]).not.toEqual(undefined);
        expect(result.CursorMovementTime * factor).toEqual(data[key].TotalEventTime);
        expect(result.ErrorRate * factor).toEqual(data[key].ValidErrorCount);
    }
};

test.skip("Winfitts", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Results } = await prepare(page, context);

    expect(Object.keys(Pratice).length).toEqual(Object.keys(RawData).length);
    for (const key in Pratice) {
        logger(`Winfitts: Account: ${key}, Compare Pratice And RawData.`);
        expect(RawData[key]).not.toEqual(undefined);
        expect(RawData[key].Account).toEqual(key);
        expect(RawData[key].ModelName).toEqual(Settings.ModelName);
        expect(RawData[key].DeviceName).toEqual(Settings.DeviceName);
        expect(Pratice[key].Account).toEqual(key);
        expect(Pratice[key].Details.length).toEqual(RawData[key].Results.length);
        const { ErrorRate, EventTime } = comparePraticeAndRawData(Pratice[key], RawData[key]);
        expect(`${ErrorRate}/${TotalTrailCount}`).toEqual(RawData[key].ErrorRate);
        expect(EventTime).toEqual(RawData[key].EventTime);
    }

    expect(Object.keys(RawData).length).toEqual(Object.keys(Results).length);
    for (const key in RawData) {
        logger(`Winfitts: Account: ${key}, Compare RawData And Result.`);
        expect(Results[key]).not.toEqual(undefined);
        expect(Results[key].Account).toEqual(key);
        expect(RawData[key].Account).toEqual(key);
        compareRawDataAndResult(RawData[key], Results[key]);
    }
});
