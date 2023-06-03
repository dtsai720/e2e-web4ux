import { Page, expect, test } from "@playwright/test";

import { Account, Settings } from "../src/config";
import { Login } from "../src/login";
import { TargetPosition, EuclideanDistance } from "../src/math";
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

        const array = await new WinfittsRawData(winfitts.ResultId()).fetch(page);
        expect(array.length).toEqual(pratices.length);

        pratices.forEach(pratice => {
            let count = 0;
            let ErrorCount = 0;
            let EventTime = 0;

            array.forEach(data => {
                if (data.Account !== pratice.Account) return;
                count++;
                expect(pratice.Results.length).toEqual(data.Results.length);

                for (let i = 0; i < pratice.Results.length; i++) {
                    expect(pratice.Results[i].Distance).toEqual(data.Results[i].Distance);
                    expect(pratice.Results[i].Width).toEqual(data.Results[i].Width);

                    const target = TargetPosition(
                        data.Results[i].Start,
                        data.Results[i].Distance * Settings.Calibrate,
                        data.Results[i].Angle
                    );
                    const difference = EuclideanDistance(target, data.Results[i].Target);
                    const radius =
                        EuclideanDistance(data.Results[i].Start, data.Results[i].Target) /
                        Settings.Calibrate;

                    console.log(difference, radius, target, data.Results[i]);
                    // expect(difference).toBeLessThan(
                    //     (data.Results[i].Width * 2) / Settings.Calibrate
                    // );

                    expect(Math.abs(radius - data.Results[i].Distance)).toBeLessThan(
                        data.Results[i].Width / Settings.Calibrate
                    );

                    expect(pratice.Results[i].Else !== null).toEqual(data.Results[i].IsFailed);
                    expect(pratice.Results[i].Else === null).toEqual(
                        data.Results[i].ErrorTime === 0
                    );
                    ErrorCount += data.Results[i].ErrorTime;

                    // expect(data.Results[i].EventTime).toEqual(
                    //     data.Results[i].Target.Timestamp - data.Results[i].Start.Timestamp
                    // );
                    EventTime += data.Results[i].EventTime;
                }

                expect(count).toEqual(1);
                expect(`${ErrorCount}/${pratice.Results.length}`).toEqual(data.ErrorRate);
                // expect(EventTime).toEqual(data.EventTime);
                expect(request.DeviceName).toEqual(data.DeviceName);
                expect(request.ModelName).toEqual(data.ModelName);
            });
        });

        const results = await new WinfittsResult(winfitts.ResultId()).fetch(page);
        array.forEach(data => {
            let count = 0;
            results.forEach(result => {
                if (data.Account !== result.Account) return;
                count++;
                const source: {
                    [key: string]: {
                        Id: number;
                        TotalCount: number;
                        ErrorCount: number;
                        TotalTime: number;
                    };
                } = {};
                for (let i = 0; i < data.Results.length; i++) {
                    const key = `${data.Results[i].Width}-${data.Results[i].Distance}`;
                    if (source[key] === undefined) {
                        source[key] = {
                            Id: data.Results[i].Id,
                            TotalCount: 0,
                            ErrorCount: 0,
                            TotalTime: 0,
                        };
                    }
                    expect(source[key].Id).toEqual(data.Results[i].Id);
                    source[key].TotalCount++;
                    source[key].ErrorCount += data.Results[i].IsFailed ? 1 : 0;
                    source[key].TotalTime += data.Results[i].EventTime;
                }

                for (let i = 0; i < result.Results.length; i++) {
                    const key = `${result.Results[i].Width}-${result.Results[i].Distance}`;
                    console.log({
                        Account: data.Account,
                        Id: source[key].Id,
                        TotalCount: source[key].TotalCount,
                        ErrorCount: source[key].ErrorCount,
                        TotalTime: source[key].TotalTime,
                        CursorMovementTime: result.Results[i].CursorMovementTime,
                    });
                    expect(source[key].Id).toEqual(result.Results[i].Id);
                    expect(source[key].ErrorCount / source[key].TotalCount).toEqual(
                        result.Results[i].ErrorRate
                    );
                    // expect(source[key].TotalTime / source[key].TotalCount).toEqual(
                    //     result.Results[i].CursorMovementTime
                    // );
                }
            });
            expect(count).toEqual(1);
        });
    });
});
