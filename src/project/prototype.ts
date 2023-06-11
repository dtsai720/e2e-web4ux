import { Page } from "@playwright/test";
import { Account } from "../config";
import { Token } from "../http/constants";
import { URL, Headers, Method, HTML } from "../http/constants";
import { CreateProjectRequest, Participant } from "./interface";
import { FetchOne } from "./interface";
import { Default } from "./constants";

const NewProjectName = (prefix: string, postfix: string) => {
    const timestamp = Math.floor(Date.now());
    if (prefix === "") prefix = Default.Prefix;
    if (postfix === "") return [Default.Postfix, prefix, timestamp.toString()].join("-");
    return [Default.Postfix, prefix, timestamp.toString(), postfix].join("-");
};

const StartTable = '<div class="name">';
const ProjectDetail = '<div class="tool">';
const ItemStart = "item draft";

const Pattern = {
    ProjectId: new RegExp(/<a href="\/Project\/Devices\/([^"]+)".+>.+/),
    Result: new RegExp(/<a href="\/Project\/.+Result\/([^"]+)".+>.+/),
    LastLine: new RegExp(/<div class="pagination-row">.*/),
} as const;

const QueryParams = {
    PageNumber: "PageNumber",
    ProjectName: "ProjectName",
    Status: "Status",
    OrderBy: "OrderBy",
    CreateBy: "CreateBy",
    ProjectListType: "ProjectListType",
} as const;

const CreateProjectParams = {
    ProjectName: "ProjectName",
    ParticipantCount: "ParticipantCount",
    Token: Token.CSRF,
    Device: {
        ModelName: "Devices[0].ModelName",
        DeviceName: "Devices[0].DeviceName",
        Sort: "Devices[0].Sort",
    },
    Task: {
        Type: "Tasks[0].TaskType",
        Sort: "Tasks[0].Sort",
        TrailsTestRound: "Tasks[0].TrailsTestRound",
    },
} as const;

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

class Project {
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

    public async create(r: CreateProjectRequest) {
        const params = this.createParams(r);
        const headers = { "content-type": Headers.ContentType.FROM, cookie: this.cookie };
        await fetch(URL.CreateProject, {
            headers: headers,
            body: params.toString(),
            method: Method.POST,
        });
    }

    public async device(page: Page, projectId: string) {
        await page.goto([URL.FetchDevicePrefix, projectId].join("/"));
        await page.waitForSelector(Selector.Device.TableRow);
        const locator = page.locator(Selector.Device.TableRow);
        const elements = {
            ModelName: locator.locator(Selector.Device.ModelName),
            DeviceName: locator.locator(Selector.Device.DeviceName),
            Id: locator.locator(Selector.Device.Id),
        } as const;
        return {
            ModelName: (await elements.ModelName.getAttribute(HTML.Attribute.Value)) || "",
            DeviceName: (await elements.DeviceName.getAttribute(HTML.Attribute.Value)) || "",
            Id: (await elements.Id.getAttribute(HTML.Attribute.Value)) || "",
        } as const;
    }

    public async participant(page: Page, projectId: string, participantCount: number) {
        await page.goto([URL.FetchParticipantPrefix, projectId].join("/"));
        await page.waitForSelector(HTML.Tag.Table);
        const output: Participant[] = [];
        for (let i = 0; i < participantCount; i++) {
            const elements = {
                Id: page.locator(Selector.Participant.Id(i)),
                Account: page.locator(Selector.Participant.Account(i)),
            } as const;
            const Id = (await elements.Id.getAttribute(HTML.Attribute.Value)) || "";
            const Account = (await elements.Account.getAttribute(HTML.Attribute.Value)) || "";
            output.push({ Id, Account });
        }
        return output;
    }

    protected toCanonicalFetchOne(array: string[]) {
        const output: FetchOne = { Name: "", ResultId: "", ProjectId: "" };
        while (array.length !== 0 && array[0] !== StartTable) array.shift();
        array.shift();
        output.Name = array.shift() || "";
        while (array.length !== 0 && !array[0].startsWith(ProjectDetail)) array.shift();
        if (array.length < 3) return output;
        output.ProjectId = array[1].replace(Pattern.ProjectId, "$1");
        output.ResultId = array[2].replace(Pattern.Result, "$1");
        return output;
    }

    protected convertToArray(html: string) {
        const candidates = html.split(Pattern.LastLine)[0].split("\n");
        const array: string[] = [];
        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i].trim();
            if (candidate === "") continue;
            array.push(candidate);
        }
        return array;
    }

    protected parseHTML(html: string) {
        const array = this.convertToArray(html);
        const output: FetchOne[] = [];
        while (array.length !== 0) {
            const sentence = array.shift() || "";
            if (!sentence.includes(ItemStart)) continue;

            const candidate: string[] = [];
            while (array.length !== 0 && !array[0].includes(ItemStart)) {
                candidate.push(array.shift() || "");
            }

            if (candidate.length === 0) break;
            output.push(this.toCanonicalFetchOne(candidate));
        }
        return output;
    }

    protected fetchOneParams(name: string, creator: string): URLSearchParams {
        const params = new URLSearchParams();
        params.append(QueryParams.PageNumber, Default.PageNumber);
        params.append(QueryParams.ProjectName, name);
        params.append(QueryParams.Status, Default.Status);
        params.append(QueryParams.OrderBy, Default.Order);
        params.append(QueryParams.CreateBy, creator);
        params.append(QueryParams.ProjectListType, Default.ListType);
        return params;
    }

    async fetchOne(name: string, creator: string) {
        const headers = {
            "content-type": Headers.ContentType.FROM,
            requestverificationtoken: this.token,
            cookie: this.cookie,
        };
        const html = await fetch(URL.ListProject, {
            headers: headers,
            body: this.fetchOneParams(name, creator).toString(),
            method: Method.POST,
        }).then(data => data.text());

        const body = this.parseHTML(html);
        for (let i = 0; i < body.length; i++) {
            if (body[i].Name === name) return body[i];
        }
        return { Name: "", ProjectId: "", ResultId: "" };
    }

    public async setup(page: Page, r: CreateProjectRequest) {
        await this.create(r);
        const detail = await this.fetchOne(r.ProjectName, Account.Email);
        const device = await this.device(page, detail.ProjectId);
        return { Detail: detail, Device: device };
    }
}

export { Project, NewProjectName };
