import { Locator, Page } from "@playwright/test";

import { SimpleProject } from "./project/project";
import { Device } from "./project/device";
import { Participant } from "./project/participant";
import { ContentType, Method, URL, Role, Label, CSRFToken, Tag } from "./http/http";
import { Settings } from "./config";
import { EuclideanDistance } from "./math";

interface CreateWinfittsRequest {
    ProjectName: string;
    ModelName: string;
    DeviceName: string;
    ParticipantCount: number;
}

const settings = [
    { Width: 3, Distance: 150, Difficulty: 5.7 },
    { Width: 15, Distance: 150, Difficulty: 3.5 },
    { Width: 3, Distance: 30, Difficulty: 3.5 },
    { Width: 15, Distance: 30, Difficulty: 1.6 },
] as const;

const TaskType = "Winfitts";
const ProjectParams = {
    ProjectName: "ProjectName",
    ParticipantCount: "ParticipantCount",
    Token: CSRFToken,
    ModelName: "Devices[0].ModelName",
    DeviceName: "Devices[0].DeviceName",
    Sort: "Devices[0].Sort",
    Task: {
        Type: "Tasks[0].TaskType",
        Sort: "Tasks[0].Sort",
        TrailsTestRound: "Tasks[0].TrailsTestRound",
    },
    Winfitts: {
        Width: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Width`;
        },
        Distance: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Distance`;
        },
        Sort: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Sort`;
        },
        Difficulty: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Difficulty`;
        },
    },
} as const;

const CreateWinfittsProject = async (
    token: string,
    cookie: string,
    request: CreateWinfittsRequest
) => {
    const param = new URLSearchParams();

    param.append(ProjectParams.ProjectName, request.ProjectName);
    param.append(ProjectParams.ParticipantCount, request.ParticipantCount.toString());
    param.append(ProjectParams.Token, token);

    param.append(ProjectParams.ModelName, request.ModelName);
    param.append(ProjectParams.DeviceName, request.DeviceName);
    param.append(ProjectParams.Sort, "0");

    param.append(ProjectParams.Task.Type, TaskType);
    param.append(ProjectParams.Task.Sort, "0");
    param.append(ProjectParams.Task.TrailsTestRound, "1");

    for (let i = 0; i < settings.length; i++) {
        param.append(ProjectParams.Winfitts.Width(i), settings[i].Width.toString());
        param.append(ProjectParams.Winfitts.Distance(i), settings[i].Distance.toString());
        param.append(ProjectParams.Winfitts.Sort(i), i.toString());
        param.append(ProjectParams.Winfitts.Difficulty(i), settings[i].Difficulty.toString());
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

interface Resolution {
    Width: number;
    Height: number;
}

const NewResolution = (w: number, h: number): Resolution => {
    return { Width: w, Height: h };
};

interface CalibrationRequest {
    Project: SimpleProject;
    Device: Device;
    Calibrate: number;
    Resolution: { Device: Resolution; Inner: Resolution; Outer: Resolution };
}

const CalibrateParams = {
    Project: { Id: "ProjectId", Name: "ProjectName", Status: "ProjectStauts" },
    Device: { Id: "DeviceId", Name: "DeviceName" },
    Resolution: {
        Device: { Width: "DeviceWidth", Height: "DeviceHeight" },
        Inner: { Width: "InnerWidth", Height: "InnerHeight" },
        Outer: { Width: "OuterWidth", Height: "OuterWidth" },
    },
    ModelName: "ModelName",
    Calibrate: "Calibrate",
    Token: CSRFToken,
} as const;

const SetupCalibration = async (token: string, cookie: string, request: CalibrationRequest) => {
    const params = new URLSearchParams();
    params.append(CalibrateParams.Project.Id, request.Project.Id);
    params.append(CalibrateParams.Project.Name, request.Project.Name);
    params.append(CalibrateParams.Project.Status, Settings.ProjectStatus);
    params.append(CalibrateParams.Device.Id, request.Device.Id);
    params.append(CalibrateParams.ModelName, request.Device.ModelName);
    params.append(CalibrateParams.Device.Name, request.Device.DeviceName);
    params.append(CalibrateParams.Calibrate, request.Calibrate.toString());

    params.append(
        CalibrateParams.Resolution.Device.Width,
        request.Resolution.Device.Width.toString()
    );
    params.append(
        CalibrateParams.Resolution.Device.Height,
        request.Resolution.Device.Height.toString()
    );

    params.append(
        CalibrateParams.Resolution.Inner.Width,
        request.Resolution.Inner.Width.toString()
    );
    params.append(
        CalibrateParams.Resolution.Inner.Height,
        request.Resolution.Inner.Height.toString()
    );

    params.append(
        CalibrateParams.Resolution.Outer.Width,
        request.Resolution.Outer.Width.toString()
    );
    params.append(
        CalibrateParams.Resolution.Outer.Height,
        request.Resolution.Outer.Height.toString()
    );
    params.append(CalibrateParams.Token, token);

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
    Results: SingleWinfittsResult[];
}

const NewClickEvent = (x: number, y: number, timestamp: number): ClickEvent => {
    return { X: x, Y: y, Timestamp: timestamp };
};

const TotalTrailCount = 32;
const Selector = {
    Pratices: {
        Start: ".start.dot",
        Target: ".target.dot",
        Light: { Start: ".start.dot.light", Target: ".target.dot.light" },
    },
    Result: { Table: "#formRemoveRowData > div.block-table > table > tbody" },
    RawData: {
        Table: "#divData",
        Head: "div.data1 > span",
        Row: "div.data1-pack",
        TrailPack: "div.data2-pack",
        SimpleRow: "div.data2 > span",
        ClickResults: "div.data3",
    },
} as const;

class WinfittsPratices {
    private account: string;
    private url: string;

    constructor(device: Device, participant: Participant) {
        this.url = [URL.StartWinfittsPrefix, device.Id].join("/");
        this.account = participant.Account;
    }

    private width(w: number) {
        return Math.abs(w - 3) < Math.abs(w - 15) ? 3 : 15;
    }

    private distance(d: number) {
        return Math.abs(d - 30) < Math.abs(d - 150) ? 30 : 150;
    }

    private difficulty(w: number, d: number) {
        const width = this.width(w);
        const distance = this.distance(d);
        if (width === 3) return distance === 30 ? 3.5 : 5.7;
        return distance === 30 ? 1.6 : 3.5;
    }

    private range(d: number): Readonly<{ Max: number; Min: number }> {
        if (d == 1.6) return { Max: 500, Min: 350 };
        if (d == 3.5) return { Max: 750, Min: 500 };
        if (d == 5.7) return { Max: 1200, Min: 900 };
        return { Max: 300, Min: 100 };
    }

    private hasFailed(d: number) {
        return Math.random() * 100 <= (Settings.WinfittsFailedRate * d) / (1.6 + 3.5 + 5.7);
    }

    private async eachTrail(page: Page) {
        await page.waitForSelector(Selector.Pratices.Light.Start);
        const start = await page.locator(Selector.Pratices.Start);
        const target = await page.locator(Selector.Pratices.Target);
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();

        if (Settings.EnableTimeSleep)
            await new Promise(f => setTimeout(f, Math.random() * 20 + 10));
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
                ) / Settings.Calibrate;
            const width = targetBox["width"] / Settings.Calibrate;

            result.Width = this.width(width);
            result.Distance = this.distance(distance);

            const difficulty = this.difficulty(width, distance);
            const range = this.range(difficulty);
            const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
            if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));

            if (this.hasFailed(difficulty)) {
                const x = (result.Start.X + result.Target.X) / 2;
                const y = (result.Start.Y + result.Target.Y) / 2;
                await page.mouse.move(x, y);
                await page.mouse.click(x, y);

                result.Else = NewClickEvent(x, y, Math.floor(Date.now()));
                const sleepTime = Math.random() * (range.Max - range.Min) + range.Min;
                if (Settings.EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
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
        await page.getByRole(Role.Button, { name: Role.Name.Starts }).click();
        await page.getByRole(Role.Link, { name: Role.Name.Start }).click();
        await page.getByRole(Role.Button, { name: Role.Name.Start }).click();
        const output: SingleWinfittsResult[] = [];
        for (let i = 0; i < TotalTrailCount; i++) {
            output.push(await this.eachTrail(page));
        }
        await page.getByRole(Role.Button, { name: Role.Name.Finish }).click();
        return { Account: this.account, Results: output } as const;
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
    Results: SingleActualWinfittsResult[];
}

class WinfittsResult {
    private url: string;

    constructor(id: string) {
        this.url = [URL.WinfittsResultPrefix, id].join("/");
    }

    private toWinfittsResult(
        array: Readonly<string[][]>,
        account: string,
        start: number
    ): Readonly<ActualWinfittsResults> {
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

    private toCanonical(array: string[][]): Readonly<ActualWinfittsResults[]> {
        const output: ActualWinfittsResults[] = [];
        for (let i = 0; i < array.length; i += 4) {
            array[i].shift(); // remove index
            const account = array[i].shift() || "";
            output.push(this.toWinfittsResult(array, account, i));
        }
        return output;
    }

    private async parse(page: Page) {
        const rows: string[][] = [];
        const table = await page.locator(Selector.Result.Table);
        for (const row of await table.locator(Tag.Tr).all()) {
            const array: string[] = [];
            for (const data of await row.locator(Tag.Td).all()) {
                const text = (await data.textContent()) || "";
                if (text.trim() === "") continue;
                array.push(text.trim());
            }
            rows.push(array);
        }
        return rows;
    }

    async fetch(page: Page) {
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
    Else: ClickEvent[];
}

interface SingleWinfitts {
    Account: string;
    ModelName: string;
    DeviceName: string;
    ErrorRate: string;
    EventTime: number;
    Results: WinfittsRow[];
}

const EventType = { Start: "start", Target: "target", Else: "else" } as const;

class WinfittsRawData {
    private url: string;
    constructor(id: string) {
        this.url = [URL.WinfittsRawDataPrefix, id].join("/");
    }

    private async head(locator: Locator) {
        const array: string[] = [];
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
        } as const;
    }

    private async toSimpleWinfittsRow(locator: Locator) {
        const array: string[] = [];
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
        } as const;
    }

    private async trail(locator: Locator) {
        const output: Readonly<WinfittsRow>[] = [];
        for (const each of await locator.locator(Selector.RawData.TrailPack).all()) {
            const row = await this.toSimpleWinfittsRow(each);
            const result: WinfittsRow = {
                TrailNumber: row.TrailNumber,
                IsFailed: row.IsFailed,
                ErrorTime: row.ErrorTime,
                Width: row.Width,
                Distance: row.Distance,
                Id: row.Id,
                Angle: row.Angle,
                EventTime: row.EventTime,
                Start: NewClickEvent(0, 0, 0),
                Target: NewClickEvent(0, 0, 0),
                Else: [],
            };

            if (isNaN(row.TrailNumber)) continue;
            for (const data of await each.locator(Selector.RawData.ClickResults).all()) {
                const array: string[] = [];
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

    async fetch(page: Page): Promise<Readonly<SingleWinfitts[]>> {
        await page.goto(this.url);
        await page.waitForSelector(Selector.RawData.Table);
        const table = await page.locator(Selector.RawData.Table);
        const output: SingleWinfitts[] = [];
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
    TotalTrailCount,
    WinfittsPratices,
    ExceptedWinfittsResult,
    WinfittsResult,
    WinfittsRawData,
};
