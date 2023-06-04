import { expect, test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { WinfittsComponents, Validate } from "../src/helper/winfitts";

test("Winfitts", async ({ page, context }) => {
    await Login(page);
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    const requirements = await WinfittsComponents(page, context);
    expect(requirements.Rawdata.length).toEqual(requirements.Pratices.length);

    requirements.Pratices.forEach(pratice => {
        requirements.Rawdata.forEach(data => {
            if (data.Account !== pratice.Account) return;
            const output = Validate.rawdata(pratice.Results, data.Results);
            expect(output.ErrorRate).toEqual(data.ErrorRate);
            // expect(output.EventTime).toEqual(data.EventTime);
            expect(Settings.DeviceName).toEqual(data.DeviceName);
            expect(Settings.ModelName).toEqual(data.ModelName);
        });
    });

    requirements.Rawdata.forEach(data => {
        requirements.Results.forEach(result => {
            if (data.Account !== result.Account) return;
            Validate.result(data.Results, result.Results);
        });
    });
});
