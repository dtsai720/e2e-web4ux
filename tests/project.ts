import { ProjectStatus } from "./config";
import { URL, ContentType, Method } from "./http";

interface SimpleProject {
    Name: string;
    Result: string;
    Id: string;
}

interface GetProjectRequest {
    ProjectName: string;
    CreatedBy: string;
}

const pattern = {
    ProjectId: new RegExp(/<a href="\/Project\/Devices\/([^\"]+)".+>.+/),
    Result: new RegExp(/<a href="\/Project\/.+Result\/([^\"]+)\".+>.+/),
};

const StartTable = '<div class="name">';
const ProjectDetail = '<div class="tool">';
const ItemStart = "item draft";
const lastLinePattern = new RegExp(/\<div class\=\"pagination\-row\"\>.*/);
const defaultOrder = "ModifyByDesc";
const defaultListType = "Grid";
const defaultPageNumber = "1";
const queryParams = {
    PageNumber: "PageNumber",
    ProjectName: "ProjectName",
    Status: "Status",
    OrderBy: "OrderBy",
    CreateBy: "CreateBy",
    ProjectListType: "ProjectListType",
};

const defaultPrefix = "ALL";
const defaultPostfix = "TEST";

const NewProjectName = (prefix: string, postfix: string): string => {
    const timestamp = Math.floor(Date.now());
    if (prefix === "") prefix = defaultPrefix;
    if (postfix === "") return [defaultPostfix, prefix, timestamp.toString()].join("-");
    return [defaultPostfix, prefix, timestamp.toString(), postfix].join("-");
};

class GetProject {
    private body: string;
    private token: string;
    private cookie: string;
    private name: string;

    constructor(token: string, cookie: string, request: GetProjectRequest) {
        const param = new URLSearchParams();
        param.append(queryParams.PageNumber, defaultPageNumber);
        param.append(queryParams.ProjectName, request.ProjectName);
        param.append(queryParams.Status, ProjectStatus);
        param.append(queryParams.OrderBy, defaultOrder);
        param.append(queryParams.CreateBy, request.CreatedBy);
        param.append(queryParams.ProjectListType, defaultListType);
        this.body = param.toString();
        this.token = token;
        this.cookie = cookie;
        this.name = request.ProjectName;
    }

    private toCanonical(array: Array<string>): SimpleProject {
        const output: SimpleProject = { Name: "", Result: "", Id: "" };
        while (array.length !== 0 && array[0] !== StartTable) array.shift();
        array.shift();
        output.Name = array.shift() || "";
        while (array.length !== 0 && !array[0].startsWith(ProjectDetail)) array.shift();
        if (array.length < 3) return output;
        output.Id = array[1].replace(pattern.ProjectId, "$1");
        output.Result = array[2].replace(pattern.Result, "$1");
        return output;
    }

    private mining(html: string): Array<string> {
        html = html.split(lastLinePattern)[0];
        const array: Array<string> = [];
        html.split("\n").forEach(body => {
            if (body.trim() === "") return;
            array.push(body.trim());
        });
        return array;
    }

    private parse(html: string): Array<SimpleProject> {
        const array = this.mining(html);
        const output: Array<SimpleProject> = [];
        while (array.length !== 0) {
            const sentence = array.shift() || "";
            if (!sentence.includes(ItemStart)) {
                continue;
            }

            const candidate: Array<string> = [];
            while (array.length !== 0 && !array[0].includes(ItemStart)) {
                candidate.push(array.shift() || "");
            }

            if (candidate.length !== 0) output.push(this.toCanonical(candidate));
        }
        return output;
    }

    async fetchOne(): Promise<SimpleProject> {
        const html = await fetch(URL.ListProject, {
            headers: {
                "content-type": ContentType.FROM,
                requestverificationtoken: this.token,
                cookie: this.cookie,
            },
            body: this.body,
            method: Method.POST,
        }).then(data => data.text());

        const body = this.parse(html);
        for (let i = 0; i < body.length; i++) {
            if (body[i].Name === this.name) return body[i];
        }
        return { Name: "", Id: "", Result: "" };
    }
}

export { SimpleProject, NewProjectName, GetProject };
