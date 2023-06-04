import { Page, expect } from "@playwright/test";

import { Account, Settings } from "../config";
import { CreateProjectRequest, Device, SimpleProject, IProject } from "../project/interface";

class Pratice {
    protected project: IProject;
    protected device: Device;
    protected detail: Readonly<SimpleProject>;

    constructor(project: IProject) {
        this.project = project;
    }

    async setup(page: Page, request: CreateProjectRequest) {
        await this.project.create(request);

        this.detail = await this.project.fetch(request.ProjectName, Account.Email);
        this.device = await this.project.device(page, this.detail.ProjectId);
    }

    async participants(page: Page) {
        const participants = await this.project.participant(
            page,
            this.detail.ProjectId,
            Settings.ParticipantCount
        );

        expect(participants.length).toEqual(Settings.ParticipantCount);
        return participants;
    }

    ResultId(): string {
        return this.detail.ResultId;
    }
}

export { Pratice };
