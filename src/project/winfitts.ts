import { Page } from "@playwright/test";

import { Token, URL, Headers, Method } from "../http/constants";
import { Settings } from "../config";
import { CreateProjectRequest, Device, FetchOne, IProject } from "./interface";
import { Project } from "./prototype";
import { Tasks, CreateProjectParams } from "./constants";

interface CalibrationRequest {
    Project: FetchOne;
    Device: Device;
    Calibrate: number;
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
    Token: Token.CSRF,
} as const;

const settings = [
    { Width: 3, Distance: 150, Difficulty: 5.7 },
    { Width: 15, Distance: 150, Difficulty: 3.5 },
    { Width: 3, Distance: 30, Difficulty: 3.5 },
    { Width: 15, Distance: 30, Difficulty: 1.6 },
] as const;

const WinfittsParams = {
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
} as const;

const Resolution = {
    Device: { Width: Settings.Width, Height: Settings.Height },
    Inner: { Width: Settings.Width, Height: Settings.Height },
    Outer: { Width: Settings.Width, Height: Settings.Height },
} as const;

class WinfittsProject extends Project implements IProject {
    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = super.createParams(r);
        params.append(CreateProjectParams.Task.Type, Tasks.Winfitts);
        params.append(CreateProjectParams.Task.TrailsTestRound, "1");
        for (let i = 0; i < settings.length; i++) {
            const setting = settings[i];
            params.append(WinfittsParams.Width(i), setting.Width.toString());
            params.append(WinfittsParams.Distance(i), setting.Distance.toString());
            params.append(WinfittsParams.Sort(i), i.toString());
            params.append(WinfittsParams.Difficulty(i), setting.Difficulty.toString());
        }

        return params;
    }

    private async calibrate(request: CalibrationRequest) {
        const params = new URLSearchParams();
        params.append(CalibrateParams.Token, this.token);
        params.append(CalibrateParams.Project.Id, request.Project.ProjectId);
        params.append(CalibrateParams.Project.Name, request.Project.Name);
        params.append(CalibrateParams.Project.Status, Settings.ProjectStatus);
        params.append(CalibrateParams.Device.Id, request.Device.Id);
        params.append(CalibrateParams.ModelName, request.Device.ModelName);
        params.append(CalibrateParams.Device.Name, request.Device.DeviceName);
        params.append(CalibrateParams.Calibrate, request.Calibrate.toString());
        params.append(CalibrateParams.Resolution.Inner.Width, Resolution.Inner.Width.toString());
        params.append(CalibrateParams.Resolution.Inner.Height, Resolution.Inner.Height.toString());
        params.append(CalibrateParams.Resolution.Outer.Width, Resolution.Outer.Width.toString());
        params.append(CalibrateParams.Resolution.Outer.Height, Resolution.Outer.Height.toString());
        params.append(CalibrateParams.Resolution.Device.Width, Resolution.Device.Width.toString());
        params.append(
            CalibrateParams.Resolution.Device.Height,
            Resolution.Device.Height.toString()
        );
        await fetch([URL.CalibrateDevicePrefix, request.Project.ProjectId].join("/"), {
            headers: { "content-type": Headers.ContentType.FROM, cookie: this.cookie },
            body: params.toString(),
            method: Method.POST,
        });
    }

    public async setup(page: Page, r: CreateProjectRequest) {
        const results = await super.setup(page, r);
        for (let i = 0; i < results.Devices.length; i++) {
            await this.calibrate({
                Project: results.Detail,
                Device: results.Devices[i],
                Calibrate: Settings.Calibrate,
            });
        }
        return results;
    }
}

export { WinfittsProject };
