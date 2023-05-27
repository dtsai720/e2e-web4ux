import { Page } from '@playwright/test';

import { URL, ContentType, Method, ProjectStatus } from "./config";
import { Project } from './project';

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

interface Device {
    ModelName: string
    DeviceName: string
    Id: string
};

const DeviceDetails = async(page: Page, projectId: string): Promise<Device> => {
    await page.goto([URL.FetchDevicePrefix, projectId].join('/'));
    await page.waitForSelector('#table-drop > tr');
    const locator = page.locator('#table-drop > tr');
    const ModelName = await locator.locator('input.modelname').getAttribute('value') || '';
    const DeviceName = await locator.locator('input.devicename').getAttribute('value') || '';
    const Id = await locator.locator('input.id').getAttribute('value') || '';
    return {ModelName, DeviceName, Id};
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

export { WinfittsProject, SetupCalibration, NewResolution, DeviceDetails };