import { Settings } from "../config";
import { URL, ContentType, Method } from "../http/http";

interface SimpleProject {
    Name: string;
    Result: string;
    Id: string;
}

interface GetProjectRequest {
    ProjectName: string;
    CreatedBy: string;
}

const StartTable = '<div class="name">';
const ProjectDetail = '<div class="tool">';
const ItemStart = "item draft";

const Pattern = {
    ProjectId: new RegExp(/<a href="\/Project\/Devices\/([^"]+)".+>.+/),
    Result: new RegExp(/<a href="\/Project\/.+Result\/([^"]+)".+>.+/),
    Lastline: new RegExp(/<div class="pagination-row">.*/),
} as const;

const Default = {
    Order: "ModifyByDesc",
    ListType: "Grid",
    PageNumber: "1",
    Prefix: "ALL",
    Postfix: "TEST",
    Status: Settings.ProjectStatus,
} as const;

const QueryParams = {
    PageNumber: "PageNumber",
    ProjectName: "ProjectName",
    Status: "Status",
    OrderBy: "OrderBy",
    CreateBy: "CreateBy",
    ProjectListType: "ProjectListType",
} as const;

const NewProjectName = (prefix: string, postfix: string) => {
    const timestamp = Math.floor(Date.now());
    if (prefix === "") prefix = Default.Prefix;
    if (postfix === "") return [Default.Postfix, prefix, timestamp.toString()].join("-");
    return [Default.Postfix, prefix, timestamp.toString(), postfix].join("-");
};

class GetProject {
    private body: string;
    private token: string;
    private cookie: string;
    private name: string;

    constructor(token: string, cookie: string, request: GetProjectRequest) {
        const param = new URLSearchParams();
        param.append(QueryParams.PageNumber, Default.PageNumber);
        param.append(QueryParams.ProjectName, request.ProjectName);
        param.append(QueryParams.Status, Default.Status);
        param.append(QueryParams.OrderBy, Default.Order);
        param.append(QueryParams.CreateBy, request.CreatedBy);
        param.append(QueryParams.ProjectListType, Default.ListType);
        this.body = param.toString();
        this.token = token;
        this.cookie = cookie;
        this.name = request.ProjectName;
    }

    private toCanonical(array: string[]) {
        const output: SimpleProject = { Name: "", Result: "", Id: "" };
        while (array.length !== 0 && array[0] !== StartTable) array.shift();
        array.shift();
        output.Name = array.shift() || "";
        while (array.length !== 0 && !array[0].startsWith(ProjectDetail)) array.shift();
        if (array.length < 3) return output;
        output.Id = array[1].replace(Pattern.ProjectId, "$1");
        output.Result = array[2].replace(Pattern.Result, "$1");
        return output;
    }

    private mining(html: string) {
        html = html.split(Pattern.Lastline)[0];
        const array: string[] = [];
        html.split("\n").forEach(body => {
            if (body.trim() === "") return;
            array.push(body.trim());
        });
        return array;
    }

    private parse(html: string) {
        const array = this.mining(html);
        const output: Readonly<SimpleProject>[] = [];
        while (array.length !== 0) {
            const sentence = array.shift() || "";
            if (!sentence.includes(ItemStart)) {
                continue;
            }

            const candidate: string[] = [];
            while (array.length !== 0 && !array[0].includes(ItemStart)) {
                candidate.push(array.shift() || "");
            }

            if (candidate.length !== 0) output.push(this.toCanonical(candidate));
        }
        return output;
    }

    async fetch() {
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
