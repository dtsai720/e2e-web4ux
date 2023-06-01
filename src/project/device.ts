import { Page } from "@playwright/test";

import { URL, Attribute } from "../http/http";

interface Device {
    ModelName: string;
    DeviceName: string;
    Id: string;
}

const Selector = {
    ModelName: "input.modelname",
    DeviceName: "input.devicename",
    Id: "input.id",
    TableRow: "#table-drop > tr",
} as const;

const DeviceDetails = async (page: Page, projectId: Readonly<string>) => {
    await page.goto([URL.FetchDevicePrefix, projectId].join("/"));
    await page.waitForSelector(Selector.TableRow);
    const locator = page.locator(Selector.TableRow);
    return {
        ModelName: (await locator.locator(Selector.ModelName).getAttribute(Attribute.Value)) || "",
        DeviceName:
            (await locator.locator(Selector.DeviceName).getAttribute(Attribute.Value)) || "",
        Id: (await locator.locator(Selector.Id).getAttribute(Attribute.Value)) || "",
    } as const;
};

export { DeviceDetails, Device };
