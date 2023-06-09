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
    create(request: CreateProjectRequest): Promise<void>;
    device(page: Page, projectId: string): Promise<Readonly<Device>>;
    participant(
        page: Page,
        projectId: string,
        participantCount: number
    ): Promise<ReadonlyArray<Participant>>;
    fetch(projectName: string, creator: string): Promise<Readonly<SimpleProject>>;
}

interface PraticeResult {
    Account: string;
    Results: ReadonlyArray<Record<string, any>>;
}

export { IProject, CreateProjectRequest, SimpleProject, Device, Participant, PraticeResult };
