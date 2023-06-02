import { Project } from "../project/project";
import { CreateProjectParams, Tasks } from "../project/constants";
import { CreateProjectRequest, Device, SimpleProject } from "../project/interface";
import { Resolution } from "./interface";
import { Settings } from "../config";
import { Token } from "../http/constants";
import { Method, URL, Headers } from "../http/constants";

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
    Token: Token.CSRF,
} as const;

const settings = [
    { Width: 3, Distance: 150, Difficulty: 5.7 },
    { Width: 15, Distance: 150, Difficulty: 3.5 },
    { Width: 3, Distance: 30, Difficulty: 3.5 },
    { Width: 15, Distance: 30, Difficulty: 1.6 },
] as const;

class CreateProject extends Project {
    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = super.createParams(r);
        params.append(CreateProjectParams.Task.Type, Tasks.Winfitts);
        params.append(CreateProjectParams.Task.TrailsTestRound, "1");
        for (let i = 0; i < settings.length; i++) {
            params.append(CreateProjectParams.Winfitts.Width(i), settings[i].Width.toString());
            params.append(
                CreateProjectParams.Winfitts.Distance(i),
                settings[i].Distance.toString()
            );
            params.append(CreateProjectParams.Winfitts.Sort(i), i.toString());
            params.append(
                CreateProjectParams.Winfitts.Difficulty(i),
                settings[i].Difficulty.toString()
            );
        }

        return params;
    }

    public async calibrate(request: CalibrationRequest) {
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
        params.append(CalibrateParams.Token, this.token);

        await fetch([URL.CalibrateDevicePrefix, request.Project.Id].join("/"), {
            headers: {
                "content-type": Headers.ContentType.FROM,
                cookie: this.cookie,
            },
            body: params.toString(),
            method: Method.POST,
        });
    }
}

export { CreateProject };
