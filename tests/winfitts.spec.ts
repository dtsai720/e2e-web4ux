import { expect, test } from '@playwright/test';

import { Login } from './login';
import { Token } from './csrf';
import { Cookies } from './cookies';
import { WinfittsProject, SetupCalibration, DeviceDetails, NewResolution } from './winfitts';
import { ProjectDetail, NewProjectName } from './project';
import { Width, Height, Calibrate, Email } from './config';

const ModelName = 'model name';
const DeviceName = 'device name';
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
            ParticipantCount: 1,
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
    });

});
