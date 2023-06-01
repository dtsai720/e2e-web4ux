import { expect, test } from "@playwright/test";

import { Login } from "./login";
import { Token } from "./csrf";
import { Cookies } from "./cookies";
import { GetProject, NewProjectName } from "./project";
import { DeviceDetails } from "./device";
import { ParticipantDetail } from "./participant";
import { Width, Height, Calibrate, Email, ParticipantCount, ModelName, DeviceName } from "./config";
import {
    CreateWinfittsProject,
    SetupCalibration,
    NewResolution,
    ExceptedWinfittsResult,
    TotalTrailCount,
    WinfittsPratices,
    WinfittsResult,
    WinfittsRawData,
} from "./winfitts";

const ProjectName = {
    Prefix: "Winfitts",
    Postfix: "",
} as const;

test.describe("Validate Winfitts", () => {
    test.beforeEach(async ({ page }) => {
        await Login(page);
    });

    test("Winfitts", async ({ page, context }) => {
        await page.setViewportSize({
            width: Width,
            height: Height,
        });
        const token = await Token(page);
        const cookie = await Cookies(context);
        const projectName = NewProjectName(ProjectName.Prefix, ProjectName.Postfix);

        await CreateWinfittsProject(token, cookie, {
            ProjectName: projectName,
            ModelName: ModelName,
            DeviceName: DeviceName,
            ParticipantCount: ParticipantCount,
        });
        const project = await new GetProject(token, cookie, {
            ProjectName: projectName,
            CreatedBy: Email,
        }).fetch();
        expect(project.Id).not.toEqual("");

        const device = await DeviceDetails(page, project.Id);
        expect(device.Id).not.toEqual("");

        await SetupCalibration(token, cookie, {
            Project: project,
            Device: device,
            Calibrate: Calibrate,
            Resolution: {
                Device: NewResolution(Width, Height),
                Inner: NewResolution(Width, Height),
                Outer: NewResolution(Width, Height),
            },
        });

        const participants = await ParticipantDetail(page, project.Id, ParticipantCount);
        expect(participants.length).toEqual(ParticipantCount);

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
