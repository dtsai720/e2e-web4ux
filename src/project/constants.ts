import { Settings } from "../config";
import { Token } from "../http/constants";

const Tasks = {
    Winfitts: "Winfitts",
    DragAndDrop: "DragDrop",
    Typing: "Typing",
} as const;

const Default = {
    Order: "ModifyByDesc",
    ListType: "Grid",
    PageNumber: "1",
    Prefix: "ALL",
    Postfix: "TEST",
    Status: Settings.ProjectStatus,
} as const;

const CreateProjectParams = {
    ProjectName: "ProjectName",
    ParticipantCount: "ParticipantCount",
    Token: Token.CSRF,
    Device: {
        ModelName: (idx: number) => {
            return `Devices[${idx}].ModelName`;
        },
        DeviceName: (idx: number) => {
            return `Devices[${idx}].DeviceName`;
        },
        Sort: (idx: number) => {
            return `Devices[${idx}].Sort`;
        },
    },
    Task: {
        Type: "Tasks[0].TaskType",
        Sort: "Tasks[0].Sort",
        TrailsTestRound: "Tasks[0].TrailsTestRound",
    },
} as const;

export { Tasks, Default, CreateProjectParams };
