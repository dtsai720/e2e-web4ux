import { Page, expect } from '@playwright/test';

import { Project } from './project';
import { Device } from './device';
import { Participant } from './participant';
import {
    Calibrate,
    ContentType,
    Method,
    ProjectStatus,
    URL,
    WinfittsFailedRate
} from "./config";

interface createWinfittsRequest {
    ProjectName: string
    ModelName: string
    DeviceName: string
    ParticipantCount: number
};

interface winfittsSetting {
    Width: number
    Distance: number
    Difficulty: number
};

const NewWinfittsSetting = (width: number, distance: number, difficulty: number): winfittsSetting => {
    return {Width: width, Distance: distance, Difficulty: difficulty};
};

const settings: Array<winfittsSetting> = [
    NewWinfittsSetting(3, 150, 5.7),
    NewWinfittsSetting(15, 150, 3.5),
    NewWinfittsSetting(3, 30, 3.5),
    NewWinfittsSetting(15, 30, 1.6),
];

const TaskType = 'Winfitts';

const WinfittsProject = async (token: string, cookie: string, request: createWinfittsRequest) => {
    const param = new URLSearchParams();

    param.append('ProjectName', request.ProjectName);
    param.append('ParticipantCount', request.ParticipantCount.toString());
    param.append('__RequestVerificationToken', token)

    param.append('Devices[0].ModelName', request.ModelName);
    param.append('Devices[0].DeviceName', request.DeviceName);
    param.append('Devices[0].Sort', '0');

    param.append('Tasks[0].TaskType', TaskType);
    param.append('Tasks[0].Sort', '0');
    param.append('Tasks[0].TrailsTestRound', '1');

    for (let i = 0; i < settings.length; i++) {
        param.append(`Tasks[0].WinfittsSettings[${i}].Width`, settings[i].Width.toString());
        param.append(`Tasks[0].WinfittsSettings[${i}].Distance`, settings[i].Distance.toString());
        param.append(`Tasks[0].WinfittsSettings[${i}].Sort`, i.toString());
        param.append(`Tasks[0].WinfittsSettings[${i}].Difficulty`, settings[i].Difficulty.toString());
    }

    await fetch(URL.CreateProject, {
        headers: {
            'content-type': ContentType.Form,
            'cookie': cookie,
        },
        body: param.toString(),
        method: Method.Post,
    });
};

interface resolution {
    Width: number
    Height: number
};

const NewResolution = (w: number, h: number): resolution => {
    return {Width: w, Height: h};
};

interface calibrationRequest {
    Project: Project
    Device: Device
    Calibrate: number
    DeviceResolution: resolution
    InnerResolution: resolution
    OuterResolution: resolution
};

const SetupCalibration = async(token: string, cookie: string, request: calibrationRequest) => {
    const param = new URLSearchParams();

    param.append('ProjectId', request.Project.Id);
    param.append('ProjectName', request.Project.Name);
    param.append('ProjectStauts', ProjectStatus);
    param.append('DeviceId', request.Device.Id);
    param.append('ModelName', request.Device.ModelName);
    param.append('DeviceName', request.Device.DeviceName);
    param.append('Calibrate', request.Calibrate.toString());

    param.append('DeviceWidth', request.DeviceResolution.Width.toString());
    param.append('DeviceHeight', request.DeviceResolution.Height.toString());

    param.append('InnerWidth', request.InnerResolution.Width.toString());
    param.append('InnerHeight', request.InnerResolution.Height.toString());

    param.append('OuterWidth', request.OuterResolution.Width.toString());
    param.append('OuterHeight', request.OuterResolution.Height.toString());
    param.append('__RequestVerificationToken', token);

    await fetch([URL.CalibrateDevicePrefix, request.Project.Id].join('/'), {
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie,
        },
        body: param.toString(),
        method: 'POST',
    });
};

const convertToDifficulty = (w: number, d: number): number => {
    const width = Math.abs(w - 3) < Math.abs(w - 15)? 3: 15;
    const distance = Math.abs(d - 30) < Math.abs(d - 150)? 30: 150;
    if (width === 3) return distance === 30? 3.5: 5.7;
    return distance === 30? 1.6: 3.5;
};

interface range {
    Max: number
    Min: number
};

const timeSleepByDifficulty = (diff: number): range => {
    switch (diff) {
        case 1.6:
            return {Max: 500, Min: 350};
        case 3.5:
            return {Max: 750, Min: 500};
        case 5.7:
            return {Max: 1200, Min: 900};
    }
    return {Max: 300, Min: 100};
};

interface clickEvent {
    X: number
    Y: number
    Timestamp: number
};

interface WinfittsResult {
    Start: clickEvent
    Target: clickEvent
    Else: clickEvent|null
};

const newClickEvent = (x: number, y: number, timestamp: number): clickEvent => {
    return {X: x, Y: y, Timestamp: timestamp};
};

const TotalTrailCount = 32;

const StartSingleWinfitts = async(page: Page, device: Device, participant: Participant):
    Promise<Array<WinfittsResult>> => {
    await page.goto([URL.StartWinfittsPrefix, device.Id].join('/'));

    await page.getByLabel('Account').fill(participant.Account);
    await page.getByRole('button', { name: 'Starts' }).click();
    await page.getByRole('link', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Start' }).click();

    const output: Array<WinfittsResult> = [];
    for(let i = 0; i < TotalTrailCount; i++) {
        await page.waitForSelector('.start.dot.light');
        const start = await page.locator('.start.dot');
        const target = await page.locator('.target.dot');
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();
        expect(startBox).not.toEqual(null);
        expect(targetBox).not.toEqual(null);

        await new Promise(f => setTimeout(f, Math.random() * 20 + 10));
        await start.click();
        const result: WinfittsResult = {
            Start: newClickEvent(0, 0, Math.floor(Date.now())),
            Target: newClickEvent(0, 0, 0),
            Else: null,
        };

        if (startBox !== null && targetBox !== null) {
            result.Start.X = startBox['x'];
            result.Start.Y = startBox['y'];
            result.Target.X = targetBox['x'];
            result.Target.Y = targetBox['y'];

            const distance = Math.pow(
                Math.pow(result.Start.X-result.Target.X, 2) +
                Math.pow(result.Start.Y-result.Target.Y, 2), 0.5) / Calibrate;
            const width = targetBox['width'] / Calibrate;
            const difficulty = convertToDifficulty(width, distance);
            const sleepRange = timeSleepByDifficulty(difficulty);
            const sleepTime = Math.random() * (sleepRange.Max - sleepRange.Min) + sleepRange.Min;

            await new Promise(f => setTimeout(f, sleepTime));
            const hasFail = Math.random() * 100 <= WinfittsFailedRate * difficulty/(1.6+3.5+5.7);

            if (hasFail) {
                const x = (result.Start.X+result.Target.X)/2;
                const y = (result.Start.Y+result.Target.Y)/2;
                await page.mouse.click(x, y);

                const timestamp = Math.floor(Date.now());
                result.Else = newClickEvent(x, y, timestamp);
                const sleepTime = Math.random() * (sleepRange.Max - sleepRange.Min) + sleepRange.Min;
                await new Promise(f => setTimeout(f, sleepTime));
            };
        };
        await page.waitForSelector('.target.dot.light');
        await target.click();
        result.Target.Timestamp = Math.floor(Date.now());
        output.push(result);
    };

    await page.getByRole('button', { name: 'Finish' }).click();
    return output;
};

export {
    WinfittsProject,
    SetupCalibration,
    NewResolution,
    StartSingleWinfitts,
    WinfittsResult,
};
