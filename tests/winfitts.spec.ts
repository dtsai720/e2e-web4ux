import { Page, expect, test } from "@playwright/test";

import { Account, Settings } from "../src/config";
import { Login } from "../src/login";
import { Token } from "../src/http/csrf";
import { Cookies } from "../src/http/cookies";
import { NewProjectName } from "../src/project/project";
import { CreateProjectRequest, Device, Participant, SimpleProject } from "../src/project/interface";
import { WinfittsPratices, PraticeResult } from "../src/winfitts/pratice";
import { CreateProject } from "../src/winfitts/project";
import { WinfittsRawData } from "../src/winfitts/rawdata";
import { WinfittsResult } from "../src/winfitts/result";

const ProjectName = {
    Prefix: "Winfitts",
    Postfix: "",
} as const;

class Winfitts {
    private project: CreateProject;
    private device: Device;
    private detail: Readonly<SimpleProject>;
    constructor(project: CreateProject) {
        this.project = project;
    }

    ResultId(): string {
        return this.detail.ResultId;
    }

    async setup(page: Page, request: CreateProjectRequest) {
        await this.project.create(request);

        this.detail = await this.project.fetch(request.ProjectName, Account.Email);
        this.device = await this.project.device(page, this.detail.ProjectId);
        await this.project.calibrate({
            Project: this.detail,
            Device: this.device,
            Calibrate: Settings.Calibrate,
            Resolution: {
                Device: { Width: Settings.Width, Height: Settings.Height },
                Inner: { Width: Settings.Width, Height: Settings.Height },
                Outer: { Width: Settings.Width, Height: Settings.Height },
            },
        });
    }

    async participants(page: Page) {
        const participants = await this.project.participant(
            page,
            this.detail.ProjectId,
            Settings.ParticipantCount
        );

        expect(participants.length).toEqual(Settings.ParticipantCount);
        return participants;
    }

    async pratice(
        page: Page,
        participants: ReadonlyArray<Participant>
    ): Promise<ReadonlyArray<PraticeResult>> {
        const pratices: Readonly<PraticeResult>[] = [];
        const winfitts = new WinfittsPratices(this.device);
        for (let i = 0; i < participants.length; i++) {
            pratices.push(await winfitts.start(page, participants[i]));
        }
        return pratices;
    }
}

test.describe("Validate Winfitts", () => {
    test.beforeEach(async ({ page }) => {
        await Login(page);
    });

    test("Winfitts", async ({ page, context }) => {
        await page.setViewportSize({
            width: Settings.Width,
            height: Settings.Height,
        });
        const token = await Token(page);
        const cookie = await Cookies(context);
        const projectName = NewProjectName(ProjectName.Prefix, ProjectName.Postfix);
        const request = {
            ProjectName: projectName,
            ModelName: Settings.ModelName,
            DeviceName: Settings.DeviceName,
            ParticipantCount: Settings.ParticipantCount,
        } as const;

        const project = new CreateProject(token, cookie);
        const winfitts = new Winfitts(project);
        await winfitts.setup(page, request);
        const participants = await winfitts.participants(page);
        const pratices = await winfitts.pratice(page, participants);

        const results = await new WinfittsResult(winfitts.ResultId()).fetch(page);

        // TODO: wait for fix.
        const array = await new WinfittsRawData(winfitts.ResultId()).fetch(page);
        // expect(array.length).toEqual(pratices.length);
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
