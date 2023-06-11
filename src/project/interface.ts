import { Page } from "@playwright/test";

interface Device {
    ModelName: string;
    DeviceName: string;
    Id: string;
}
interface CreateProjectRequest {
    ProjectName: string;
    ModelName: string;
    DeviceName: string;
    ParticipantCount: number;
}
interface Participant {
    Id: string;
    Account: string;
}
interface FetchOne {
    Name: string;
    ProjectId: string;
    ResultId: string;
}
interface Resolution {
    Width: number;
    Height: number;
}

interface IProject {
    setup(p: Page, r: CreateProjectRequest): Promise<{ Device: Device; Detail: FetchOne }>;
    create(r: CreateProjectRequest): Promise<void>;
    device(p: Page, id: string): Promise<Device>;
    participant(p: Page, id: string, count: number): Promise<Participant[]>;
    fetchOne(name: string, creator: string): Promise<FetchOne>;
}

export { IProject, CreateProjectRequest, Participant, FetchOne, Resolution, Device };
