import { Page } from "@playwright/test";

interface CreateProjectRequest {
    ProjectName: string;
    ModelName: string;
    DeviceName: string;
    ParticipantCount: number;
}

interface SimpleProject {
    Name: string;
    ResultId: string;
    ProjectId: string;
}

interface Device {
    ModelName: string;
    DeviceName: string;
    Id: string;
}

interface Participant {
    Id: string;
    Account: string;
}

interface IProject {
    create(request: CreateProjectRequest);
    device(page: Page, projectId: string);
    participant(page: Page, projectId: string, participantCount: number);
    fetch(projectName: string, creator: string);
}

export { IProject, CreateProjectRequest, SimpleProject, Device, Participant };
