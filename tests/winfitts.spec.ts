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
import { detail } from "../src/results/interface";

const prepare = async (page: Page, context: BrowserContext) => {
    const token = await Token(page);
    const cookie = await Cookies(context);
    const projectName = NewProjectName("Winfitts", "");
    const request = {
        ProjectName: projectName,
        ParticipantCount: Settings.ParticipantCount,
        DeviceCount: Settings.DeviceCount,
    } as const;
    const project = new WinfittsProject(token, cookie);
    const details = await project.setup(page, request);
    const participants = await project.participant(
        page,
        details.Detail.ProjectId,
        request.ParticipantCount
    );
    const devices = await project.device(page, details.Detail.ProjectId);
    const wp = new WinfittsPratices();
    const Pratice = await wp.start(page, devices, participants);
    const wrd = new WinfittsRawData();
    const RawData = await wrd.fetchAll(page, details.Detail.ResultId);
    const wr = new WinfittsResult();
    const Summary = await wr.summary(page, details.Detail.ResultId);
    const Results = await wr.results(page, details.Detail.ResultId);
    return { Pratice, RawData, Summary, Results };
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

const compareRawDataAndResult = (rawdata: WinfittsFetchOne, results: detail[]) => {
    const data = convertToResult(rawdata);
    expect(results.length).toEqual(Object.keys(data).length);
    const factor = TotalTrailCount / results.length;
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (!("Width" in result)) throw new Error("");
        logger(`Winfitts: Width: ${result.Width} And Distance: ${result.Distance}`);
        const key = `${result.Width}-${result.Distance}`;
        expect(data[key]).not.toEqual(undefined);
        expect(result.CursorMovementTime * factor).toEqual(data[key].TotalEventTime);
        expect(result.ErrorRate * factor).toEqual(data[key].ValidErrorCount * 100);
    }
};

interface SimpleSummary {
    CursorMovementTime: number;
    ValidErrorCount: number;
}

function* generateRawData(rawdata: Record<string, Record<string, WinfittsFetchOne>>) {
    for (const account in rawdata) {
        for (const device in rawdata[account]) {
            const fetchOne = rawdata[account][device];
            const prefix = `${fetchOne.ModelName}-${fetchOne.DeviceName}`;
            for (let i = 0; i < fetchOne.Results.length; i++) {
                const title = fetchOne.Results[i].Title;
                const postfix = `${title.Width}-${title.Distance}`;
                const key = [prefix, postfix].join("-");
                yield { title, key };
            }
        }
    }
}

const normalizeRawData = (rawdata: Record<string, Record<string, WinfittsFetchOne>>) => {
    const output: Record<string, SimpleSummary> = {};
    const candidates = generateRawData(rawdata);
    for (let current = candidates.next(); !current.done; current = candidates.next()) {
        const title = current.value.title;
        const key = current.value.key;
        if (output[key] === undefined) output[key] = { CursorMovementTime: 0, ValidErrorCount: 0 };
        output[key].CursorMovementTime += title.EventTime;
        output[key].ValidErrorCount += title.IsFailed ? 1 : 0;
    }

    return output;
};

test("Winfitts", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const { Pratice, RawData, Summary, Results } = await prepare(page, context);

    expect(Object.keys(Pratice).length).toEqual(Object.keys(RawData).length);
    for (const account in Pratice) {
        logger(`Winfitts: Account: ${account}, Compare Pratice And RawData.`);
        expect(RawData[account]).not.toEqual(undefined);
        expect(Object.keys(Pratice[account]).length).toEqual(Object.keys(RawData[account]).length);

        for (const key in Pratice[account]) {
            logger(`Winfitts: Device: ${key}, Compare Pratice And RawData.`);
            const pratice = Pratice[account][key];
            const data = RawData[account][key];
            expect(data).not.toEqual(undefined);
            expect(pratice.Account).toEqual(account);
            expect(data.Account).toEqual(account);
            expect(pratice.Details.length).toEqual(data.Results.length);
            const { ErrorRate, EventTime } = comparePraticeAndRawData(pratice, data);
            expect(`${ErrorRate}/${TotalTrailCount}`).toEqual(data.ErrorRate);
            expect(EventTime).toEqual(data.EventTime);
        }
    }

    expect(Object.keys(RawData).length).toEqual(Object.keys(Results).length);
    for (const account in RawData) {
        logger(`Winfitts: Account: ${account}, Compare RawData And Results.`);
        expect(Results[account]).not.toEqual(undefined);

        for (const device in RawData[account]) {
            logger(`Winfitts: Device: ${device}, Compare RawData And Results.`);
            expect(Results[account][device]).not.toEqual(undefined);
            const result = Results[account][device];
            const data = RawData[account][device];
            compareRawDataAndResult(data, result);
        }
    }

    // Compare RawData And Summary
    const nrd = normalizeRawData(RawData);
    expect(Object.keys(nrd).length).toEqual(Object.keys(Summary).length);
    for (const key in nrd) {
        expect(Summary[key]).not.toEqual(undefined);
        const data = nrd[key];
        const summary = Summary[key];
        const factor = (TotalTrailCount * Settings.ParticipantCount) / 4;
        if (!("CursorMovementTime" in summary)) throw new Error("");
        expect(data.CursorMovementTime).toEqual(Math.round(summary.CursorMovementTime * factor));
        expect(data.ValidErrorCount * 100).toEqual(Math.round(summary.ErrorRate * factor));
    }
});
