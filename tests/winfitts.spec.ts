import { expect, test } from "@playwright/test";

import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { GetProject, NewProjectName } from "../src/project/project";
import { DeviceDetails } from "../src/project/device";
import { ParticipantDetail } from "../src/project/participant";
import { Account, Settings } from "../src/config";
import {
    CreateWinfittsProject,
    SetupCalibration,
    NewResolution,
    ExceptedWinfittsResult,
    WinfittsPratices,
    WinfittsResult,
    WinfittsRawData,
} from "../src/winfitts";

const ProjectName = {
    Prefix: "Winfitts",
    Postfix: "",
} as const;

test.describe("Validate Winfitts", () => {
    test.beforeEach(async ({ page }) => {
        await Login(page);
    });

    test.skip("Winfitts", async ({ page, context }) => {
        await page.setViewportSize({
            width: Settings.Width,
            height: Settings.Height,
        });
        const token = await Token(page);
        const cookie = await Cookies(context);
        const projectName = NewProjectName(ProjectName.Prefix, ProjectName.Postfix);

        await CreateWinfittsProject(token, cookie, {
            ProjectName: projectName,
            ModelName: Settings.ModelName,
            DeviceName: Settings.DeviceName,
            ParticipantCount: Settings.ParticipantCount,
        });
        const project = await new GetProject(token, cookie, {
            ProjectName: projectName,
            CreatedBy: Account.Email,
        }).fetch();
        expect(project.Id).not.toEqual("");

        const device = await DeviceDetails(page, project.Id);
        expect(device.Id).not.toEqual("");

        await SetupCalibration(token, cookie, {
            Project: project,
            Device: device,
            Calibrate: Settings.Calibrate,
            Resolution: {
                Device: NewResolution(Settings.Width, Settings.Height),
                Inner: NewResolution(Settings.Width, Settings.Height),
                Outer: NewResolution(Settings.Width, Settings.Height),
            },
        });

        const participants = await ParticipantDetail(page, project.Id, Settings.ParticipantCount);
        expect(participants.length).toEqual(Settings.ParticipantCount);

        const pratices: Readonly<ExceptedWinfittsResult>[] = [];
        for (let i = 0; i < participants.length; i++) {
            const winfitts = await new WinfittsPratices(device, participants[i]).start(page);
            pratices.push(winfitts);
        }
        // TODO: compare partice and result
        const results = await new WinfittsResult(project.Result).fetch(page);

        // TODO: wait for fix.
        const array = await new WinfittsRawData(project.Result).fetch(page);
        expect(array.length).toEqual(pratices.length);
        pratices.forEach(pratice => {
            let count = 0;
            array.forEach(data => {
                if (data.Account !== pratice.Account) return;
                count++;
                expect(pratice.Results.length).toEqual(data.Results.length);
                let totalEventTime = 0;
                let errorRate = 0;
                for (let i = 0; i < pratice.Results.length; i++) {
                    expect(pratice.Results[i].Distance).toEqual(data.Results[i].Distance);
                    expect(pratice.Results[i].Width).toEqual(data.Results[i].Width);

                    // expect(pratice.Results[i].Start.X).toEqual(data.Results[i].Start.X)
                    // expect(pratice.Results[i].Start.Y).toEqual(data.Results[i].Start.Y)
                    // expect(pratice.Results[i].Target.X).toEqual(data.Results[i].Target.X)
                    // expect(pratice.Results[i].Target.Y).toEqual(data.Results[i].Target.Y)
                    expect(pratice.Results[i].Else !== null).toEqual(data.Results[i].IsFailed);
                    const eventTime =
                        pratice.Results[i].Target.Timestamp - pratice.Results[i].Start.Timestamp;
                    // expect(eventTime).toEqual(data.Results[i].EventTime);
                    // console.log({ Source: eventTime, Result: data.Results[i].EventTime });
                    totalEventTime += eventTime;
                    errorRate += data.Results[i].IsFailed ? 1 : 0;
                }
                // expect(totalEventTime).toEqual(data.EventTime);
                // expect(errorRate).toEqual(data.EventTime);
            });
            expect(count).toEqual(1);
        });
    });
});
