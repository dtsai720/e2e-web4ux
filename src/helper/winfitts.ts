import { BrowserContext, Page, expect } from "@playwright/test";

import { Settings } from "../config";
import { Pratice } from "./pratice";
import { IPratice } from "./interface";
import { CreateProjectRequest, Participant } from "../project/interface";
import { WinfittsPratices, PraticeResult, SingleWinfittsResult } from "../winfitts/pratice";
import { WinfittsRawData } from "../winfitts/rawdata";
import { CreateProject } from "../winfitts/project";
import { WinfittsResults } from "../winfitts/result";
import { CreateProjectRequirements } from "./helper";
import { RawDataDetail } from "../winfitts/interface";

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

class Winfitts extends Pratice implements IPratice {
    protected project: CreateProject;

    constructor(project: CreateProject) {
        super(project);
        this.project = project;
    }

    async setup(page: Page, request: CreateProjectRequest) {
        await super.setup(page, request);
        const Resolution = {
            Device: { Width: Settings.Width, Height: Settings.Height },
            Inner: { Width: Settings.Width, Height: Settings.Height },
            Outer: { Width: Settings.Width, Height: Settings.Height },
        } as const;
        await this.project.calibrate({
            Project: this.detail,
            Device: this.device,
            Calibrate: Settings.Calibrate,
            Resolution: Resolution,
        });
    }

    async pratice(page: Page, participants: ReadonlyArray<Participant>) {
        const pratices: Readonly<PraticeResult>[] = [];
        const winfitts = new WinfittsPratices(this.device);
        for (let i = 0; i < participants.length; i++) {
            pratices.push(await winfitts.start(page, participants[i]));
        }
        return pratices;
    }
}

const convertToResultMapping = (souece: ReadonlyArray<RawDataDetail>) => {
    const output: ResultMapping = {};
    for (let i = 0; i < souece.length; i++) {
        const key = `${souece[i].Title.Width}-${souece[i].Title.Distance}`;
        if (output[key] === undefined) {
            output[key] = {
                Id: souece[i].Title.Id,
                TotalCount: 0,
                ErrorCount: 0,
                TotalTime: 0,
            };
        }
        expect(output[key].Id).toEqual(souece[i].Title.Id);
        output[key].TotalCount++;
        output[key].ErrorCount += souece[i].Title.IsFailed ? 1 : 0;
        output[key].TotalTime += souece[i].Title.EventTime;
    }
    return output;
};

const WinfittsComponents = async (page: Page, context: BrowserContext) => {
    const requirements = await CreateProjectRequirements(page, context, ProjectName);
    const project = new CreateProject(requirements.Token, requirements.Cookie);
    const winfitts = new Winfitts(project);
    await winfitts.setup(page, requirements.Request);
    const participants = await winfitts.participants(page);
    const Pratices = await winfitts.pratice(page, participants);

    const Rawdata = await new WinfittsRawData(winfitts.ResultId()).fetchAll(page);
    const Results = await new WinfittsResults(winfitts.ResultId(), 4).fetchAll(page);
    return { Pratices, Rawdata, Results };
};

const fetchPositionFromRawData = (detail: RawDataDetail) => {
    const candidate = detail.Detail;
    while (candidate.length !== 0 && candidate[0].EventType !== "start") candidate.shift();
    if (candidate.length === 0) throw new Error("");
    const Start = candidate[0];
    candidate.shift();
    if (candidate.length !== 0 && candidate[candidate.length - 1].EventType !== "target")
        throw new Error("");
    const Target = candidate[candidate.length - 1];
    candidate.pop();
    const Else = candidate;
    return { Start, Target, Else } as const;
};

class Validate {
    static rawdata(pratice: SingleWinfittsResult[], rawdata: RawDataDetail[]) {
        let ErrorCount = 0;
        let EventTime = 0;
        expect(pratice.length).toEqual(rawdata.length);

        for (let i = 0; i < pratice.length; i++) {
            expect(pratice[i].Distance).toEqual(rawdata[i].Title.Distance);
            expect(pratice[i].Width).toEqual(rawdata[i].Title.Width);
            const position = fetchPositionFromRawData(rawdata[i]);
            // const target = TargetPosition(
            //     position.Start,
            //     rawdata[i].Title.Distance * Settings.Calibrate,
            //     rawdata[i].Title.Angle
            // );
            // const difference = EuclideanDistance(target, position.Target);
            // const radius =
            //     EuclideanDistance(position.Start, position.Target) / Settings.Calibrate;
            // expect(difference).toBeLessThan(
            //     (rawdata[i].Title.Width * 2) / Settings.Calibrate
            // );

            // expect(Math.abs(radius - rawdata[i].Title.Distance)).toBeLessThan(
            //     rawdata[i].Title.Width / Settings.Calibrate
            // );

            expect(pratice[i].Else !== null).toEqual(rawdata[i].Title.IsFailed);
            expect(pratice[i].Else === null).toEqual(rawdata[i].Title.ErrorTime === 0);
            ErrorCount += rawdata[i].Title.ErrorTime;

            expect(rawdata[i].Title.EventTime).toEqual(
                position.Target.Timestamp - position.Start.Timestamp
            );
            EventTime += rawdata[i].Title.EventTime;
        }
        return {
            ErrorRate: `${ErrorCount}/${pratice.length}`,
            EventTime: EventTime,
        } as const;
    }

    static result(
        rawdata: ReadonlyArray<RawDataDetail>,
        results: ReadonlyArray<Record<string, any>>
    ) {
        const mapping = convertToResultMapping(rawdata);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const key = `${result.Width}-${result.Distance}`;
            expect(mapping[key].Id).toEqual(result.Id);
            expect(mapping[key].ErrorCount / mapping[key].TotalCount).toEqual(result.ErrorRate);
            expect(mapping[key].TotalTime / mapping[key].TotalCount).toEqual(
                result.CursorMovementTime
            );
        }
    }
}

export { WinfittsComponents, Validate };
