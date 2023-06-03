import { URL, Headers, Method } from "../http/constants";
import { SimpleProject } from "./interface";
import { Default } from "./constants";

const StartTable = '<div class="name">';
const ProjectDetail = '<div class="tool">';
const ItemStart = "item draft";

const Pattern = {
    ProjectId: new RegExp(/<a href="\/Project\/Devices\/([^"]+)".+>.+/),
    Result: new RegExp(/<a href="\/Project\/.+Result\/([^"]+)".+>.+/),
    Lastline: new RegExp(/<div class="pagination-row">.*/),
} as const;

const QueryParams = {
    PageNumber: "PageNumber",
    ProjectName: "ProjectName",
    Status: "Status",
    OrderBy: "OrderBy",
    CreateBy: "CreateBy",
    ProjectListType: "ProjectListType",
} as const;

class FetchProject {
    private body: string;
    private token: string;
    private cookie: string;
    private name: string;

    constructor(
        token: string,
        cookie: string,
        request: {
            ProjectName: string;
            CreatedBy: string;
        }
    ) {
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
        const output: SimpleProject = { Name: "", ResultId: "", ProjectId: "" };
        while (array.length !== 0 && array[0] !== StartTable) array.shift();
        array.shift();
        output.Name = array.shift() || "";
        while (array.length !== 0 && !array[0].startsWith(ProjectDetail)) array.shift();
        if (array.length < 3) return output;
        output.ProjectId = array[1].replace(Pattern.ProjectId, "$1");
        output.ResultId = array[2].replace(Pattern.Result, "$1");
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
                "content-type": Headers.ContentType.FROM,
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
        return { Name: "", ProjectId: "", ResultId: "" };
    }
}

export { FetchProject };
