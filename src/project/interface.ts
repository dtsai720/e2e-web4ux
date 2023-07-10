import { Page } from "@playwright/test";

interface Device {
    ModelName: string;
    DeviceName: string;
    Id: string;
}
interface CreateProjectRequest {
    ProjectName: string;
    ParticipantCount: number;
    DeviceCount: number;
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
    setup(p: Page, r: CreateProjectRequest): Promise<{ Devices: Device[]; Detail: FetchOne }>;
    create(r: CreateProjectRequest): Promise<void>;
    device(p: Page, id: string): Promise<Device[]>;
    participant(p: Page, id: string): Promise<Participant[]>;
}

export { IProject, CreateProjectRequest, Participant, FetchOne, Resolution, Device };
