import { CSRFToken } from "../http/http";

const Tasks = {
    Winfitts: "Winfitts",
    DragAndDrop: "DragDrop",
} as const;

const CreateProjectParams = {
    ProjectName: "ProjectName",
    ParticipantCount: "ParticipantCount",
    Token: CSRFToken,
    Device: {
        ModelName: "Devices[0].ModelName",
        DeviceName: "Devices[0].DeviceName",
        Sort: "Devices[0].Sort",
    },
    Task: {
        Type: "Tasks[0].TaskType",
        Sort: "Tasks[0].Sort",
        TrailsTestRound: "Tasks[0].TrailsTestRound",
    },
    Winfitts: {
        Width: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Width`;
        },
        Distance: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Distance`;
        },
        Sort: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Sort`;
        },
        Difficulty: (num: number) => {
            return `Tasks[0].WinfittsSettings[${num}].Difficulty`;
        },
    },
} as const;

export { Tasks, CreateProjectParams };
