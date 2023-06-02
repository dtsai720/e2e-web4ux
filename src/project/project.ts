import { Page } from "@playwright/test";

import { URL, Headers, Method, HTML } from "../http/constants";
import { IProject, CreateProjectRequest, Device, Participant } from "./interface";
import { CreateProjectParams, Default } from "./constants";
import { FetchProject } from "./fetch";

const NewProjectName = (prefix: string, postfix: string) => {
    const timestamp = Math.floor(Date.now());
    if (prefix === "") prefix = Default.Prefix;
    if (postfix === "") return [Default.Postfix, prefix, timestamp.toString()].join("-");
    return [Default.Postfix, prefix, timestamp.toString(), postfix].join("-");
};

const Selector = {
    Participant: {
        Id: (num: number) => {
            return `input[name="Participants[${num}].Id"]`;
        },
        Account: (num: number) => {
            return `input[name="Participants[${num}].Account"]`;
        },
    },
    Device: {
        ModelName: "input.modelname",
        DeviceName: "input.devicename",
        Id: "input.id",
        TableRow: "#table-drop > tr",
    },
} as const;

class Project implements IProject {
    protected token: string;
    protected cookie: string;

    constructor(token: string, cookie: string) {
        this.token = token;
        this.cookie = cookie;
    }

    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = new URLSearchParams();
        params.append(CreateProjectParams.ProjectName, r.ProjectName);
        params.append(CreateProjectParams.ParticipantCount, r.ParticipantCount.toString());
        params.append(CreateProjectParams.Token, this.token);

        params.append(CreateProjectParams.Device.ModelName, r.ModelName);
        params.append(CreateProjectParams.Device.DeviceName, r.DeviceName);
        params.append(CreateProjectParams.Device.Sort, "0");
        params.append(CreateProjectParams.Task.Sort, "0");
        return params;
    }

    public async create(request: CreateProjectRequest) {
        const params = this.createParams(request);
        await fetch(URL.CreateProject, {
            headers: {
                "content-type": Headers.ContentType.FROM,
                cookie: this.cookie,
            },
            body: params.toString(),
            method: Method.POST,
        });
    }

    public async device(page: Page, projectId: string): Promise<Readonly<Device>> {
        await page.goto([URL.FetchDevicePrefix, projectId].join("/"));
        await page.waitForSelector(Selector.Device.TableRow);
        const locator = page.locator(Selector.Device.TableRow);
        return {
            ModelName:
                (await locator
                    .locator(Selector.Device.ModelName)
                    .getAttribute(HTML.Attribute.Value)) || "",
            DeviceName:
                (await locator
                    .locator(Selector.Device.DeviceName)
                    .getAttribute(HTML.Attribute.Value)) || "",
            Id:
                (await locator.locator(Selector.Device.Id).getAttribute(HTML.Attribute.Value)) ||
                "",
        };
    }

    public async participant(
        page: Page,
        projectId: string,
        participantCount: number
    ): Promise<ReadonlyArray<Participant>> {
        await page.goto([URL.FetchParticipantPrefix, projectId].join("/"));
        await page.waitForSelector(HTML.Tag.Table);
        const output: Participant[] = [];
        for (let i = 0; i < participantCount; i++) {
            output.push({
                Id:
                    (await page
                        .locator(Selector.Participant.Id(i))
                        .getAttribute(HTML.Attribute.Value)) || "",
                Account:
                    (await page
                        .locator(Selector.Participant.Account(i))
                        .getAttribute(HTML.Attribute.Value)) || "",
            });
        }
        return output;
    }

    async fetch(projectName: string, creator: string) {
        const project = new FetchProject(this.token, this.cookie, {
            ProjectName: projectName,
            CreatedBy: creator,
        });
        return await project.fetch();
    }
}

export { NewProjectName, Project };
