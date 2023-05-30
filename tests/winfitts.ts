import { Locator, Page } from "@playwright/test";

import { SimpleProject } from "./project";
import { Device } from "./device";
import { Participant } from "./participant";
import { ContentType, Method, URL, Button, Label, CSRFToken, Tag } from "./http";
import { Calibrate, EnableTimeSleep, ProjectStatus, WinfittsFailedRate } from "./config";
import { EuclideanDistance } from "./math";

interface CreateWinfittsRequest {
    ProjectName: string;
    ModelName: string;
    DeviceName: string;
    ParticipantCount: number;
}

interface WinfittsSetting {
    Width: number;
    Distance: number;
    Difficulty: number;
}

const settings: Array<WinfittsSetting> = [
    { Width: 3, Distance: 150, Difficulty: 5.7 },
    { Width: 15, Distance: 150, Difficulty: 3.5 },
    { Width: 3, Distance: 30, Difficulty: 3.5 },
    { Width: 15, Distance: 30, Difficulty: 1.6 },
];

const TaskType = "Winfitts";

const CreateWinfittsProject = async (
    token: string,
    cookie: string,
    request: CreateWinfittsRequest
) => {
    const param = new URLSearchParams();

    param.append("ProjectName", request.ProjectName);
    param.append("ParticipantCount", request.ParticipantCount.toString());
    param.append(CSRFToken, token);

    param.append("Devices[0].ModelName", request.ModelName);
    param.append("Devices[0].DeviceName", request.DeviceName);
    param.append("Devices[0].Sort", "0");

    param.append("Tasks[0].TaskType", TaskType);
    param.append("Tasks[0].Sort", "0");
    param.append("Tasks[0].TrailsTestRound", "1");

    for (let i = 0; i < settings.length; i++) {
        param.append(`Tasks[0].WinfittsSettings[${i}].Width`, settings[i].Width.toString());
        param.append(`Tasks[0].WinfittsSettings[${i}].Distance`, settings[i].Distance.toString());
        param.append(`Tasks[0].WinfittsSettings[${i}].Sort`, i.toString());
        param.append(
            `Tasks[0].WinfittsSettings[${i}].Difficulty`,
            settings[i].Difficulty.toString()
        );
    }

    await fetch(URL.CreateProject, {
        headers: {
            "content-type": ContentType.FROM,
            cookie: cookie,
        },
        body: param.toString(),
        method: Method.POST,
    });
};

interface resolution {
    Width: number;
    Height: number;
}

const NewResolution = (w: number, h: number): resolution => {
    return { Width: w, Height: h };
};

interface CalibrationRequest {
    Project: SimpleProject;
    Device: Device;
    Calibrate: number;
    DeviceResolution: resolution;
    InnerResolution: resolution;
    OuterResolution: resolution;
}

const CalibratedParams = {
    ProjectId: "ProjectId",
    ProjectName: "ProjectName",
    ProjectStauts: "ProjectStauts",
    DeviceId: "DeviceId",
    ModelName: "ModelName",
    DeviceName: "DeviceName",
    Calibrate: "Calibrate",
    DeviceWidth: "DeviceWidth",
    DeviceHeight: "DeviceHeight",
    InnerWidth: "InnerWidth",
    InnerHeight: "InnerHeight",
    OuterWidth: "OuterWidth",
    OuterHeight: "OuterHeight",
};

const SetupCalibration = async (token: string, cookie: string, request: CalibrationRequest) => {
    const params = new URLSearchParams();
    params.append(CalibratedParams.ProjectId, request.Project.Id);
    params.append(CalibratedParams.ProjectName, request.Project.Name);
    params.append(CalibratedParams.ProjectStauts, ProjectStatus);
    params.append(CalibratedParams.DeviceId, request.Device.Id);
    params.append(CalibratedParams.ModelName, request.Device.ModelName);
    params.append(CalibratedParams.DeviceName, request.Device.DeviceName);
    params.append(CalibratedParams.Calibrate, request.Calibrate.toString());

    params.append(CalibratedParams.DeviceWidth, request.DeviceResolution.Width.toString());
    params.append(CalibratedParams.DeviceHeight, request.DeviceResolution.Height.toString());

    params.append(CalibratedParams.InnerWidth, request.InnerResolution.Width.toString());
    params.append(CalibratedParams.InnerHeight, request.InnerResolution.Height.toString());

    params.append(CalibratedParams.OuterWidth, request.OuterResolution.Width.toString());
    params.append(CalibratedParams.OuterHeight, request.OuterResolution.Height.toString());
    params.append(CSRFToken, token);

    await fetch([URL.CalibrateDevicePrefix, request.Project.Id].join("/"), {
        headers: {
            "content-type": ContentType.FROM,
            cookie: cookie,
        },
        body: params.toString(),
        method: Method.POST,
    });
};

interface ClickEvent {
    X: number;
    Y: number;
    Timestamp: number;
}

interface SingleWinfittsResult {
    Start: ClickEvent;
    Target: ClickEvent;
    Else: ClickEvent | null;
    Width: number;
    Distance: number;
}

const NewSingleWinfittsResult = (): SingleWinfittsResult => {
    return {
        Start: NewClickEvent(0, 0, 0),
        Target: NewClickEvent(0, 0, 0),
        Else: null,
        Width: 0,
        Distance: 0,
    };
};

interface ExceptedWinfittsResult {
    Account: string;
    Results: Array<SingleWinfittsResult>;
}

const NewClickEvent = (x: number, y: number, timestamp: number): ClickEvent => {
    return { X: x, Y: y, Timestamp: timestamp };
};

const TotalTrailCount = 32;
const Link = "link";
const Selector = {
    Pratices: {
        Start: ".start.dot",
        Target: ".target.dot",
        Light: {
            Start: ".start.dot.light",
            Target: ".target.dot.light",
        },
    },
    Result: {
        Table: "#formRemoveRowData > div.block-table > table > tbody",
    },
    RawData: {
        Table: "#divData",
        Head: "div.data1 > span",
        Row: "div.data1-pack",
        TrailPack: "div.data2-pack",
        SimpleRow: "div.data2 > span",
        ClickResults: "div.data3",
    },
};

class WinfittsPratices {
    private account: string;
    private url: string;

    constructor(device: Device, participant: Participant) {
        this.url = [URL.StartWinfittsPrefix, device.Id].join("/");
        this.account = participant.Account;
    }

    private width(w: number): number {
        return Math.abs(w - 3) < Math.abs(w - 15) ? 3 : 15;
    }

    private distance(d: number): number {
        return Math.abs(d - 30) < Math.abs(d - 150) ? 30 : 150;
    }

    private difficulty(w: number, d: number): number {
        const width = this.width(w);
        const distance = this.distance(d);
        if (width === 3) return distance === 30 ? 3.5 : 5.7;
        return distance === 30 ? 1.6 : 3.5;
    }

    private range(d: number) {
        if (d == 1.6) return { Max: 500, Min: 350 };
        if (d == 3.5) return { Max: 750, Min: 500 };
        if (d == 5.7) return { Max: 1200, Min: 900 };
        return { Max: 300, Min: 100 };
    }

    private hasFailed(d: number): boolean {
        return Math.random() * 100 <= (WinfittsFailedRate * d) / (1.6 + 3.5 + 5.7);
    }

    private async eachTrail(page: Page): Promise<SingleWinfittsResult> {
        await page.waitForSelector(Selector.Pratices.Light.Start);
        const start = await page.locator(Selector.Pratices.Start);
        const target = await page.locator(Selector.Pratices.Target);
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();

        if (EnableTimeSleep) await new Promise(f => setTimeout(f, Math.random() * 20 + 10));
        await start.click();
        const result = NewSingleWinfittsResult();
        result.Start.Timestamp = Math.floor(Date.now());

        if (startBox !== null && targetBox !== null) {
            result.Start.X = startBox["x"];
            result.Start.Y = startBox["y"];
            result.Target.X = targetBox["x"];
            result.Target.Y = targetBox["y"];
            const distance =
                EuclideanDistance(
                    result.Start.X,
                    result.Target.X,
                    result.Start.Y,
                    result.Target.Y
                ) / Calibrate;
            const width = targetBox["width"] / Calibrate;

            result.Width = this.width(width);
            result.Distance = this.distance(distance);

            const difficulty = this.difficulty(width, distance);
            const range = this.range(difficulty);
            const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
            if (EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));

            if (this.hasFailed(difficulty)) {
                const x = (result.Start.X + result.Target.X) / 2;
                const y = (result.Start.Y + result.Target.Y) / 2;
                await page.mouse.move(x, y);
                await page.mouse.click(x, y);

                result.Else = NewClickEvent(x, y, Math.floor(Date.now()));
                const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
                if (EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
            }
        }
        await page.waitForSelector(Selector.Pratices.Light.Target);
        await page.mouse.move(result.Target.X, result.Target.Y);
        await target.click();
        result.Target.Timestamp = Math.floor(Date.now());
        return result;
    }

    async start(page: Page) {
        await page.goto(this.url);
        await page.getByLabel(Label.Account).fill(this.account);
        await page.getByRole(Button, { name: "Starts" }).click();
        await page.getByRole(Link, { name: "Start" }).click();
        await page.getByRole(Button, { name: "Start" }).click();
        const output: Array<SingleWinfittsResult> = [];
        for (let i = 0; i < TotalTrailCount; i++) {
            output.push(await this.eachTrail(page));
        }
        await page.getByRole(Button, { name: "Finish" }).click();
        return { Account: this.account, Results: output };
    }
}

interface SingleActualWinfittsResult {
    Id: number;
    Width: number;
    Distance: number;
    CursorMovementTime: number;
    ErrorRate: number;
}

interface ActualWinfittsResults {
    Account: string;
    Results: Array<SingleActualWinfittsResult>;
}

class WinfittsResult {
    private url: string;

    constructor(id: string) {
        this.url = [URL.WinfittsResultPrefix, id].join("/");
    }

    private toWinfittsResult(array: Array<Array<string>>, account: string, start: number) {
        const result: ActualWinfittsResults = { Account: account, Results: [] };
        for (let i = 0; i < 4; i++) {
            const Id = parseFloat(array[start + i][0]);
            const wd = array[start + i][1].split("/");
            const Width = parseInt(wd[0]);
            const Distance = parseInt(wd[1]);
            const CursorMovementTime = parseInt(array[start + i][2]);
            const ErrorRate = parseFloat(array[start + i][3].replace(" %", "")) * 0.01;
            result.Results.push({ Id, Width, Distance, CursorMovementTime, ErrorRate });
        }
        return result;
    }

    private toCanonical(array: Array<Array<string>>): Array<ActualWinfittsResults> {
        const output: Array<ActualWinfittsResults> = [];
        for (let i = 0; i < array.length; i += 4) {
            array[i].shift(); // remove index
            const account = array[i].shift() || "";
            output.push(this.toWinfittsResult(array, account, i));
        }
        return output;
    }

    private async parse(page: Page): Promise<Array<Array<string>>> {
        const rows: Array<Array<string>> = [];
        const table = await page.locator(Selector.Result.Table);
        for (const row of await table.locator(Tag.Tr).all()) {
            const array: Array<string> = [];
            for (const data of await row.locator(Tag.Td).all()) {
                const text = (await data.textContent()) || "";
                if (text.trim() === "") continue;
                array.push(text.trim());
            }
            rows.push(array);
        }
        return rows;
    }

    async fetch(page: Page): Promise<Array<ActualWinfittsResults>> {
        await page.goto(this.url);
        const array = await this.parse(page);
        return this.toCanonical(array);
    }
}

interface SimpleWinfittsRow {
    TrailNumber: number;
    IsFailed: boolean;
    ErrorTime: number;
    Width: number;
    Distance: number;
    Id: number;
    Angle: number;
    EventTime: number;
}

interface WinfittsRow extends SimpleWinfittsRow {
    Start: ClickEvent;
    Target: ClickEvent;
    Else: Array<ClickEvent>;
}

interface SingleWinfitts {
    Account: string;
    ModelName: string;
    DeviceName: string;
    ErrorRate: string;
    EventTime: number;
    Results: Array<WinfittsRow>;
}

const EventType = {
    Start: "start",
    Target: "target",
    Else: "else",
};

class WinfittsRawData {
    private url: string;
    constructor(id: string) {
        this.url = [URL.WinfittsRawDataPrefix, id].join("/");
    }

    private async head(locator: Locator) {
        const array: Array<string> = [];
        for (const column of await locator.locator(Selector.RawData.Head).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return {
            Account: array[1],
            ModelName: array[2],
            DeviceName: array[3],
            ErrorRate: array[4],
            EventTime: parseInt(array[5]),
        };
    }

    private async toSimpleWinfittsRow(locator: Locator): Promise<SimpleWinfittsRow> {
        const array: Array<string> = [];
        for (const column of await locator.locator(Selector.RawData.SimpleRow).all()) {
            const text = (await column.textContent()) || "";
            array.push(text.trim());
        }
        return {
            TrailNumber: parseInt(array[0]),
            IsFailed: array[1] === "Yes",
            ErrorTime: parseInt(array[2]),
            Width: parseInt(array[3]),
            Distance: parseInt(array[4]),
            Id: parseFloat(array[5]),
            Angle: parseInt(array[6]),
            EventTime: parseInt(array[7]),
        };
    }

    private async trail(locator: Locator): Promise<Array<WinfittsRow>> {
        const output: Array<WinfittsRow> = [];
        for (const each of await locator.locator(Selector.RawData.TrailPack).all()) {
            const simple = await this.toSimpleWinfittsRow(each);
            const result: WinfittsRow = {
                TrailNumber: simple.TrailNumber,
                IsFailed: simple.IsFailed,
                ErrorTime: simple.ErrorTime,
                Width: simple.Width,
                Distance: simple.Distance,
                Id: simple.Id,
                Angle: simple.Angle,
                EventTime: simple.EventTime,
                Start: NewClickEvent(0, 0, 0),
                Target: NewClickEvent(0, 0, 0),
                Else: [],
            };

            if (isNaN(simple.TrailNumber)) continue;
            for (const data of await each.locator(Selector.RawData.ClickResults).all()) {
                const array: Array<string> = [];
                for (const column of await data.locator(Tag.Span).all()) {
                    const text = (await column.textContent()) || "";
                    array.push(text.trim());
                }
                array[1] = array[1].slice(1, -1);
                const position = array[1].split(",");
                const event = NewClickEvent(
                    parseInt(position[0].trim()),
                    parseInt(position[1].trim()),
                    parseInt(array[2])
                );
                if (array[0] === EventType.Start) result.Start = event;
                if (array[0] === EventType.Target) result.Target = event;
                if (array[0] === EventType.Else) result.Else.push(event);
            }
            output.push(result);
        }
        return output;
    }

    async fetch(page: Page): Promise<Array<SingleWinfitts>> {
        await page.goto(this.url);
        await page.waitForSelector(Selector.RawData.Table);
        const table = await page.locator(Selector.RawData.Table);
        const output: Array<SingleWinfitts> = [];
        for (const row of await table.locator(Selector.RawData.Row).all()) {
            const participant = await this.head(row);
            output.push({
                Account: participant.Account,
                DeviceName: participant.DeviceName,
                ModelName: participant.ModelName,
                ErrorRate: participant.ErrorRate,
                EventTime: participant.EventTime,
                Results: await this.trail(row),
            });
        }
        return output;
    }
}

export {
    CreateWinfittsProject,
    SetupCalibration,
    NewResolution,
    WinfittsPratices,
    ExceptedWinfittsResult,
    TotalTrailCount,
    WinfittsResult,
    WinfittsRawData,
};
