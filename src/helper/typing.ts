import { Page, BrowserContext } from "@playwright/test";

import { Account } from "../config";
import { CreateProject } from "../typing/project";
import { CreateProjectRequest, Device, SimpleProject } from "../project/interface";
import { CreateProjectRequirements } from "./helper";

const ProjectName = { Prefix: "Typing", Postfix: "" } as const;

class Typing {
    private project: CreateProject;
    private device: Device;
    private detail: Readonly<SimpleProject>;

    constructor(project: CreateProject) {
        this.project = project;
    }

    async setup(page: Page, request: CreateProjectRequest) {
        await this.project.create(request);
        this.detail = await this.project.fetch(request.ProjectName, Account.Email);
        this.device = await this.project.device(page, this.detail.ProjectId);
    }
}

const TypingComponents = async (page: Page, context: BrowserContext) => {
    const requirements = await CreateProjectRequirements(page, context, ProjectName);
    const project = new CreateProject(requirements.Token, requirements.Cookie);
    const typing = new Typing(project);
    await typing.setup(page, requirements.Request);
};

export { TypingComponents };
