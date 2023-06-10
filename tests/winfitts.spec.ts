import { expect, test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { WinfittsProject } from "../src/project/winfitts";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/prototype";
import { WinfittsPratices } from "../src/pratice/winfitts";
import { WinfittsRawData } from "../src/rawdata/winfitts";

test("Winfitts", async ({ page, context }) => {
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    await Login(page);
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
    const pratice = new WinfittsPratices();
    const output = await pratice.start(page, device.Id, participants);
    const wrd = new WinfittsRawData();
    const rawdata = await wrd.fetchAll(page, details.Detail.ResultId);
    for (const key in output) {
        expect(rawdata[key]).not.toEqual(undefined);
        expect(output[key].Details.length).toEqual(rawdata[key].Results.length);
        for (let i = 0; i < output[key].Details.length; i++) {
            const source = output[key].Details[i];
            const data = rawdata[key].Results[i];
            expect(source.Distance).toEqual(data.Title.Distance);
            expect(source.Width).toEqual(data.Title.Width);
            // const timestamp = source.Target.Timestamp - source.Start.Timestamp
            // expect(timestamp).toEqual(data.Detail)
        }
    }
    console.log(JSON.stringify(output));
    console.log("--------------------------------------------------");
    console.log(JSON.stringify(rawdata));
    // console.log(JSON.stringify(output))
    // const components = await WinfittsComponents(page, context);
    // expect(components.Rawdata.length).toEqual(components.Pratices.length);
    // // expect(components.Rawdata.length).toEqual(components.Results.length);

    // components.Pratices.forEach(pratice => {
    //     components.Rawdata.forEach(data => {
    //         if (data.Account !== pratice.Account) return;
    //         const output = Validate.rawdata(pratice.Results, data.Results);
    //         expect(output.ErrorRate).toEqual(data.ErrorRate);
    //         expect(output.EventTime).toEqual(data.EventTime);
    //         expect(Settings.DeviceName).toEqual(data.DeviceName);
    //         expect(Settings.ModelName).toEqual(data.ModelName);
    //     });
    // });

    // components.Rawdata.forEach(data => {
    //     components.Results.forEach(result => {
    //         if (data.Account !== result.Account) return;
    //         Validate.result(data.Results, result.Results);
    //     });
    // });
});
