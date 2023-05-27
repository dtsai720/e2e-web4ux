import { Page } from '@playwright/test';

import { URL } from './config';

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

export { DeviceDetails, Device };