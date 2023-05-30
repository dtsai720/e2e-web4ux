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

const prefixProjectName = "Winfitts";
const postfixProjectName = "";

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
        const projectName = NewProjectName(prefixProjectName, postfixProjectName);

        await CreateWinfittsProject(token, cookie, {
            ProjectName: projectName,
            ModelName: ModelName,
            DeviceName: DeviceName,
            ParticipantCount: ParticipantCount,
        });
        const project = await new GetProject(token, cookie, {
            ProjectName: projectName,
            CreatedBy: Email,
        }).fetchOne();
        expect(project.Id).not.toEqual("");

        const device = await DeviceDetails(page, project.Id);
        expect(device.Id).not.toEqual("");

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
        for (let i = 0; i < participants.length; i++) {
            const winfitts = await new WinfittsPratices(device, participants[i]).start(page);
            partice.push(winfitts);
        }
        // TODO: compare partice and result
        const result = await new WinfittsResult(project.Result).fetch(page);

        const rawdata = await new WinfittsRawData(project.Result).fetch(page);
        // TODO: compare partice and rawdata
        expect(rawdata.length).toEqual(ParticipantCount);
        for (let i = 0; i < rawdata.length; i++) {
            expect(rawdata[i].Results.length).toEqual(TotalTrailCount);
        }
    });
});
