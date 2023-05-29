import { Page } from "@playwright/test";

import { Project } from "./project";
import { Device } from "./device";
import { Participant } from "./participant";
import {
    Calibrate,
    ContentType,
    EnableTimeSleep,
    Method,
    ProjectStatus,
    URL,
    WinfittsFailedRate,
} from "./config";

interface createWinfittsRequest {
    ProjectName: string;
    ModelName: string;
    DeviceName: string;
    ParticipantCount: number;
}

interface winfittsSetting {
    Width: number;
    Distance: number;
    Difficulty: number;
}

const NewWinfittsSetting = (
    width: number,
    distance: number,
    difficulty: number
): winfittsSetting => {
    return { Width: width, Distance: distance, Difficulty: difficulty };
};

const settings: Array<winfittsSetting> = [
    NewWinfittsSetting(3, 150, 5.7),
    NewWinfittsSetting(15, 150, 3.5),
    NewWinfittsSetting(3, 30, 3.5),
    NewWinfittsSetting(15, 30, 1.6),
];

const TaskType = "Winfitts";

const WinfittsProject = async (token: string, cookie: string, request: createWinfittsRequest) => {
    const param = new URLSearchParams();

    param.append("ProjectName", request.ProjectName);
    param.append("ParticipantCount", request.ParticipantCount.toString());
    param.append("__RequestVerificationToken", token);

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
            "content-type": ContentType.Form,
            cookie: cookie,
        },
        body: param.toString(),
        method: Method.Post,
    });
};

interface resolution {
    Width: number;
    Height: number;
}

const NewResolution = (w: number, h: number): resolution => {
    return { Width: w, Height: h };
};

interface calibrationRequest {
    Project: Project;
    Device: Device;
    Calibrate: number;
    DeviceResolution: resolution;
    InnerResolution: resolution;
    OuterResolution: resolution;
}

const SetupCalibration = async (token: string, cookie: string, request: calibrationRequest) => {
    const param = new URLSearchParams();

    param.append("ProjectId", request.Project.Id);
    param.append("ProjectName", request.Project.Name);
    param.append("ProjectStauts", ProjectStatus);
    param.append("DeviceId", request.Device.Id);
    param.append("ModelName", request.Device.ModelName);
    param.append("DeviceName", request.Device.DeviceName);
    param.append("Calibrate", request.Calibrate.toString());

    param.append("DeviceWidth", request.DeviceResolution.Width.toString());
    param.append("DeviceHeight", request.DeviceResolution.Height.toString());

    param.append("InnerWidth", request.InnerResolution.Width.toString());
    param.append("InnerHeight", request.InnerResolution.Height.toString());

    param.append("OuterWidth", request.OuterResolution.Width.toString());
    param.append("OuterHeight", request.OuterResolution.Height.toString());
    param.append("__RequestVerificationToken", token);

    await fetch([URL.CalibrateDevicePrefix, request.Project.Id].join("/"), {
        headers: {
            "content-type": ContentType.Form,
            cookie: cookie,
        },
        body: param.toString(),
        method: Method.Post,
    });
};

const normalizedWidth = (w: number): number => {
    return Math.abs(w - 3) < Math.abs(w - 15) ? 3 : 15;
};

const normalizedDistance = (d: number): number => {
    return Math.abs(d - 30) < Math.abs(d - 150) ? 30 : 150;
};

const convertToDifficulty = (w: number, d: number): number => {
    const width = normalizedWidth(w);
    const distance = normalizedDistance(d);
    if (width === 3) return distance === 30 ? 3.5 : 5.7;
    return distance === 30 ? 1.6 : 3.5;
};

interface range {
    Max: number;
    Min: number;
}

const timeSleepByDifficulty = (diff: number): range => {
    switch (diff) {
        case 1.6:
            return { Max: 500, Min: 350 };
        case 3.5:
            return { Max: 750, Min: 500 };
        case 5.7:
            return { Max: 1200, Min: 900 };
    }
    return { Max: 300, Min: 100 };
};

interface clickEvent {
    X: number;
    Y: number;
    Timestamp: number;
}

interface SingleWinfittsResult {
    Start: clickEvent;
    Target: clickEvent;
    Else: clickEvent | null;
    Width: number;
    Distance: number;
}

interface ExceptedWinfittsResult {
    Account: string;
    Results: Array<SingleWinfittsResult>;
}

const newClickEvent = (x: number, y: number, timestamp: number): clickEvent => {
    return { X: x, Y: y, Timestamp: timestamp };
};

const TotalTrailCount = 32;

const StartSingleWinfitts = async (
    page: Page,
    device: Device,
    participant: Participant
): Promise<ExceptedWinfittsResult> => {
    await page.goto([URL.StartWinfittsPrefix, device.Id].join("/"));

    await page.getByLabel("Account").fill(participant.Account);
    await page.getByRole("button", { name: "Starts" }).click();
    await page.getByRole("link", { name: "Start" }).click();
    await page.getByRole("button", { name: "Start" }).click();

    const output: Array<SingleWinfittsResult> = [];
    for (let i = 0; i < TotalTrailCount; i++) {
        await page.waitForSelector(".start.dot.light");
        const start = await page.locator(".start.dot");
        const target = await page.locator(".target.dot");
        const startBox = await start.boundingBox();
        const targetBox = await target.boundingBox();

        if (EnableTimeSleep) await new Promise(f => setTimeout(f, Math.random() * 20 + 10));
        await start.click();
        const result: SingleWinfittsResult = {
            Start: newClickEvent(0, 0, Math.floor(Date.now())),
            Target: newClickEvent(0, 0, 0),
            Else: null,
            Width: 0,
            Distance: 0,
        };

        if (startBox !== null && targetBox !== null) {
            result.Start.X = startBox["x"];
            result.Start.Y = startBox["y"];
            result.Target.X = targetBox["x"];
            result.Target.Y = targetBox["y"];

            const distance =
                Math.pow(
                    Math.pow(result.Start.X - result.Target.X, 2) +
                        Math.pow(result.Start.Y - result.Target.Y, 2),
                    0.5
                ) / Calibrate;
            const width = targetBox["width"] / Calibrate;

            result.Width = normalizedWidth(width);
            result.Distance = normalizedDistance(distance);

            const difficulty = convertToDifficulty(width, distance);
            const sleepRange = timeSleepByDifficulty(difficulty);
            const sleepTime = Math.random() * (sleepRange.Max - sleepRange.Min) + sleepRange.Min;

            if (EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
            const hasFail =
                Math.random() * 100 <= (WinfittsFailedRate * difficulty) / (1.6 + 3.5 + 5.7);

            if (hasFail) {
                const x = (result.Start.X + result.Target.X) / 2;
                const y = (result.Start.Y + result.Target.Y) / 2;
                await page.mouse.click(x, y);

                const timestamp = Math.floor(Date.now());
                result.Else = newClickEvent(x, y, timestamp);
                const sleepTime =
                    Math.random() * (sleepRange.Max - sleepRange.Min) + sleepRange.Min;
                if (EnableTimeSleep) await new Promise(f => setTimeout(f, sleepTime));
            }
        }
        await page.waitForSelector(".target.dot.light");
        await target.click();
        result.Target.Timestamp = Math.floor(Date.now());
        output.push(result);
    }
    await page.getByRole("button", { name: "Finish" }).click();
    return { Account: participant.Account, Results: output };
};

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

const FetchWinfittsResult = async (
    page: Page,
    id: string
): Promise<Array<ActualWinfittsResults>> => {
    await page.goto([URL.WinfittsResultPrefix, id].join("/"));
    const table = await page.locator("#formRemoveRowData > div.block-table > table > tbody");
    const rows: Array<Array<string>> = [];
    // Fetch All element from table.
    for (const row of await table.locator("tr").all()) {
        const array: Array<string> = [];
        for (const data of await row.locator("td").all()) {
            const text = (await data.textContent()) || "";
            if (text.trim() === "") continue;
            array.push(text.trim());
        }
        rows.push(array);
    }

    // Group element by account.
    const output: Array<ActualWinfittsResults> = [];
    for (let i = 0; i < rows.length; i += 4) {
        rows[i].shift(); // remove index
        const account = rows[i].shift() || "";
        const result: ActualWinfittsResults = { Account: account, Results: [] };

        for (let j = 0; j < 4; j++) {
            const Id = parseFloat(rows[i + j][0]);
            const wd = rows[i + j][1].split("/");
            const Width = parseInt(wd[0]);
            const Distance = parseInt(wd[1]);
            const CursorMovementTime = parseInt(rows[i + j][2]);
            const ErrorRate = parseFloat(rows[i + j][3].replace(" %", "")) * 0.01;
            result.Results.push({ Id, Width, Distance, CursorMovementTime, ErrorRate });
        }
        output.push(result);
    }
    return output;
};

interface WinfittsRow {
    TrailNumber: number;
    IsFailed: boolean;
    ErrorTime: number;
    Width: number;
    Distance: number;
    Id: number;
    Angle: number;
    EventTime: number;
    Start: clickEvent;
    Target: clickEvent;
    Else: Array<clickEvent>;
}

interface SingleWinfitts {
    Account: string;
    ModelName: string;
    DeviceName: string;
    ErrorRate: string;
    EventTime: number;
    Results: Array<WinfittsRow>;
}

const EventTypeStart = "start";
const EventTypeTarget = "target";
const EventTypeElse = "else";

const FetchWinfittsRawData = async (page: Page, id: string): Promise<Array<SingleWinfitts>> => {
    await page.goto([URL.WinfittsRawDataPrefix, id].join("/"));
    await page.waitForSelector("#divData");
    const table = await page.locator("#divData");
    const output: Array<SingleWinfitts> = [];

    for (const row of await table.locator("div.data1-pack").all()) {
        const title: Array<string> = [];
        const participant: SingleWinfitts = {
            Account: "",
            ModelName: "",
            DeviceName: "",
            ErrorRate: "",
            EventTime: 0,
            Results: [],
        };

        for (const each of await row.locator(".data1 > span").all()) {
            const text = (await each.textContent()) || "";
            title.push(text.trim());
        }

        participant.Account = title[1];
        participant.ModelName = title[2];
        participant.DeviceName = title[3];
        participant.ErrorRate = title[4];
        participant.EventTime = parseInt(title[5]);

        for (const each of await row.locator("div.data2-pack").all()) {
            const result: WinfittsRow = {
                TrailNumber: 0,
                IsFailed: false,
                ErrorTime: 0,
                Width: 0,
                Distance: 0,
                Id: 0,
                Angle: 0,
                EventTime: 0,
                Start: newClickEvent(0, 0, 0),
                Target: newClickEvent(0, 0, 0),
                Else: [],
            };

            for (const data of await each.locator("div.data2").all()) {
                const array: Array<string> = [];
                for (const column of await data.locator("span").all()) {
                    const text = (await column.textContent()) || "";
                    array.push(text.trim());
                }
                result.TrailNumber = parseInt(array[0]);
                result.IsFailed = array[1] === "Yes";
                result.ErrorTime = parseInt(array[2]);
                result.Width = parseInt(array[3]);
                result.Distance = parseInt(array[4]);
                result.Id = parseFloat(array[5]);
                result.Angle = parseInt(array[6]);
                result.EventTime = parseInt(array[7]);
            }

            for (const data of await each.locator("div.data3").all()) {
                const array: Array<string> = [];
                for (const column of await data.locator("span").all()) {
                    const text = (await column.textContent()) || "";
                    array.push(text.trim());
                }
                array[1] = array[1].slice(1, -1);
                const position = array[1].split(",");
                const event = newClickEvent(
                    parseInt(position[0].trim()),
                    parseInt(position[1].trim()),
                    parseInt(array[2])
                );
                if (array[0] === EventTypeStart) result.Start = event;
                if (array[0] === EventTypeTarget) result.Target = event;
                if (array[0] === EventTypeElse) result.Else.push(event);
            }
            if (isNaN(result.TrailNumber)) continue;
            participant.Results.push(result);
        }
        output.push(participant);
    }
    return output;
};

export {
    WinfittsProject,
    SetupCalibration,
    NewResolution,
    StartSingleWinfitts,
    ExceptedWinfittsResult,
    FetchWinfittsResult,
    FetchWinfittsRawData,
    TotalTrailCount,
};
