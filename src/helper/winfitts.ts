import { BrowserContext, Page, expect } from "@playwright/test";

import { TargetPosition, EuclideanDistance } from "../math";
import { Account, Settings } from "../config";
import { Token } from "../http/csrf";
import { Cookies } from "../http/cookies";
import { NewProjectName } from "../project/project";
import { CreateProjectRequest, Device, Participant, SimpleProject } from "../project/interface";
import { WinfittsPratices, PraticeResult, SingleWinfittsResult } from "../winfitts/pratice";
import { RawdataSingleRow, WinfittsRawData } from "../winfitts/rawdata";
import { CreateProject } from "../winfitts/project";
import { ResultSingleRow, WinfittsResult } from "../winfitts/result";

const ProjectName = {
    Prefix: "Winfitts",
    Postfix: "",
} as const;

interface ResultMapping {
    [key: string]: {
        Id: number;
        TotalCount: number;
        ErrorCount: number;
        TotalTime: number;
    };
}

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

const convertToResultMapping = (
    souece: ReadonlyArray<RawdataSingleRow>
): Readonly<ResultMapping> => {
    const output: ResultMapping = {};
    for (let i = 0; i < souece.length; i++) {
        const key = `${souece[i].Width}-${souece[i].Distance}`;
        if (output[key] === undefined) {
            output[key] = {
                Id: souece[i].Id,
                TotalCount: 0,
                ErrorCount: 0,
                TotalTime: 0,
            };
        }
        expect(output[key].Id).toEqual(souece[i].Id);
        output[key].TotalCount++;
        output[key].ErrorCount += souece[i].IsFailed ? 1 : 0;
        output[key].TotalTime += souece[i].EventTime;
    }
    return output;
};

const WinfittsComponents = async (page: Page, context: BrowserContext) => {
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
    const Pratices = await winfitts.pratice(page, participants);

    const Rawdata = await new WinfittsRawData(winfitts.ResultId()).fetch(page);
    const Results = await new WinfittsResult(winfitts.ResultId()).fetch(page);
    return { Pratices, Rawdata, Results };
};

class Validate {
    static rawdata(
        pratice: ReadonlyArray<SingleWinfittsResult>,
        rawdata: ReadonlyArray<RawdataSingleRow>
    ) {
        let ErrorCount = 0;
        let EventTime = 0;
        expect(pratice.length).toEqual(rawdata.length);

        for (let i = 0; i < pratice.length; i++) {
            expect(pratice[i].Distance).toEqual(rawdata[i].Distance);
            expect(pratice[i].Width).toEqual(rawdata[i].Width);

            const target = TargetPosition(
                rawdata[i].Start,
                rawdata[i].Distance * Settings.Calibrate,
                rawdata[i].Angle
            );
            const difference = EuclideanDistance(target, rawdata[i].Target);
            const radius =
                EuclideanDistance(rawdata[i].Start, rawdata[i].Target) / Settings.Calibrate;

            console.log(difference, radius, target, rawdata[i]);
            // expect(difference).toBeLessThan(
            //     (data.Results[i].Width * 2) / Settings.Calibrate
            // );

            expect(Math.abs(radius - rawdata[i].Distance)).toBeLessThan(
                rawdata[i].Width / Settings.Calibrate
            );

            expect(pratice[i].Else !== null).toEqual(rawdata[i].IsFailed);
            expect(pratice[i].Else === null).toEqual(rawdata[i].ErrorTime === 0);
            ErrorCount += rawdata[i].ErrorTime;

            // expect(data.Results[i].EventTime).toEqual(
            //     data.Results[i].Target.Timestamp - data.Results[i].Start.Timestamp
            // );
            EventTime += rawdata[i].EventTime;
        }

        return {
            ErrorRate: `${ErrorCount}/${pratice.length}`,
            EventTime: EventTime,
        } as const;
    }
    static result(
        rawdata: ReadonlyArray<RawdataSingleRow>,
        result: ReadonlyArray<ResultSingleRow>
    ) {
        const mapping = convertToResultMapping(rawdata);
        for (let i = 0; i < result.length; i++) {
            const key = `${result[i].Width}-${result[i].Distance}`;
            // console.log({
            //     Account: data.Account,
            //     Id: mapping[key].Id,
            //     TotalCount: mapping[key].TotalCount,
            //     ErrorCount: mapping[key].ErrorCount,
            //     TotalTime: mapping[key].TotalTime,
            //     CursorMovementTime: result[i].CursorMovementTime,
            // });
            expect(mapping[key].Id).toEqual(result[i].Id);
            expect(mapping[key].ErrorCount / mapping[key].TotalCount).toEqual(result[i].ErrorRate);
            // expect(mapping[key].TotalTime / mapping[key].TotalCount).toEqual(
            //     result[i].CursorMovementTime
            // );
        }
    }
}

export { WinfittsComponents, Validate };
