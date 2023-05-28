import { expect, test } from '@playwright/test';

import { Login } from './login';
import { Token } from './csrf';
import { Cookies } from './cookies';
import { ProjectDetail, NewProjectName } from './project';
import { DeviceDetails } from './device';
import { ParticipantDetail } from './participant';
import {
    Width,
    Height,
    Calibrate,
    Email,
    ParticipantCount,
    ModelName,
    DeviceName
} from './config';
import {
    WinfittsProject,
    SetupCalibration,
    NewResolution,
    StartSingleWinfitts,
    FetchWinfittsResult,
    ExceptedWinfittsResult,
    FetchWinfittsRawData,
    TotalTrailCount
} from './winfitts';

const prefixProjectName = 'Winfitts';
const postfixProjectName = '';

test.describe('Validate Winfitts', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

    test('Winfitts', async({ page, context }) => {
        await page.setViewportSize({
            width: Width,
            height: Height,
        });
        const token = await Token(page);
        const cookie = await Cookies(context);
        const projectName = NewProjectName(prefixProjectName, postfixProjectName);

        await WinfittsProject(token, cookie, {
            ProjectName: projectName,
            ModelName: ModelName,
            DeviceName: DeviceName,
            ParticipantCount: ParticipantCount,
        });
        const project = await ProjectDetail(token, cookie, {
            ProjectName: projectName,
            CreatedBy: Email,
        });
        expect(project.Id).not.toEqual('');

        const device = await DeviceDetails(page, project.Id);
        expect(device.Id).not.toEqual('');

        await SetupCalibration(token, cookie, {
            Project: project,
            Device: device,
            Calibrate: Calibrate,
            DeviceResolution: NewResolution(Width, Height),
            InnerResolution: NewResolution(Width, Height),
            OuterResolution: NewResolution(Width, Height),
        });

        const participants = await ParticipantDetail(page, project.Id, ParticipantCount);
        expect(participants.length).toEqual(ParticipantCount);

        const partice: Array<ExceptedWinfittsResult> = [];
        for(let i = 0; i < participants.length; i++) {
            const winfitts = await StartSingleWinfitts(page, device, participants[i]);
            partice.push(winfitts);
        };
        // TODO: compare partice and result
        const result = await FetchWinfittsResult(page, project.Result);
        // TODO: compare partice and rawdata
        const rawdata = await FetchWinfittsRawData(page, project.Result);
        expect(rawdata.length).toEqual(ParticipantCount);
        for (let i = 0; i < rawdata.length; i++) {
            expect(rawdata[i].Results.length).toEqual(TotalTrailCount);
        }
    });
});
