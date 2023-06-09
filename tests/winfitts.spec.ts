import { expect, test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { WinfittsComponents, Validate } from "../src/helper/winfitts";

test("Winfitts", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
    const components = await WinfittsComponents(page, context);
    expect(components.Rawdata.length).toEqual(components.Pratices.length);
    expect(components.Rawdata.length).toEqual(components.Results.length);

    components.Pratices.forEach(pratice => {
        components.Rawdata.forEach(data => {
            if (data.Account !== pratice.Account) return;
            const output = Validate.rawdata(pratice.Results, data.Results);
            expect(output.ErrorRate).toEqual(data.ErrorRate);
            // expect(output.EventTime).toEqual(data.EventTime);
            expect(Settings.DeviceName).toEqual(data.DeviceName);
            expect(Settings.ModelName).toEqual(data.ModelName);
        });
    });

    components.Rawdata.forEach(data => {
        components.Results.forEach(result => {
            if (data.Account !== result.Account) return;
            Validate.result(data.Results, result.Results);
        });
    });
});
