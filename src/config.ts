import "dotenv/config";

const Default = {
    Width: 1920,
    Height: 1080,
    Calibrate: 4.125,
    ParticipantCount: 12,
    DeviceCount: "1",
    WinfittsFailedRate: 10,
    MouseMoveDelay: "15",
    ProjectStatus: "Draft",
    EnableTimeSleep: "True",
    DragAndDropDelay: "20",
    Typing: {
        TotalTimer: "1",
        CountdownTimer: "60",
        Time: "45",
    },
    WaittingResultInSecond: "5",
} as const;

const Account = {
    Email: process.env.Email || "",
    Password: process.env.Password || "",
} as const;

const Settings = {
    Host: process.env.Host || "",
    ExperimentHost: process.env.ExperimentHost || "",
    Width: parseInt(process.env.Width || Default.Width.toString()),
    Height: parseInt(process.env.Height || Default.Height.toString()),
    Calibrate: parseFloat(process.env.Calibrate || Default.Calibrate.toString()),
    ParticipantCount: parseInt(process.env.ParticipantCount || Default.ParticipantCount.toString()),
    WinfittsFailedRate: parseInt(
        process.env.WinfittsFailedRate || Default.WinfittsFailedRate.toString()
    ),
    EnableTimeSleep: process.env.EnableTimeSleep === Default.EnableTimeSleep,
    ProjectStatus: Default.ProjectStatus,
    MouseMoveDelay: parseInt(process.env.MouseMoveDelay || Default.MouseMoveDelay),
    Typing: {
        TotalTimer: parseInt(process.env.TypingTotalTimer || Default.Typing.TotalTimer),
        CountdownTimer: parseInt(process.env.TypingCountdownTimer || Default.Typing.CountdownTimer),
        Time: parseInt(process.env.TypingTime || Default.Typing.Time) * 1000,
        Delay: 50,
    },
    DragAndDropDelay: parseInt(process.env.DragAndDropDelay || Default.DragAndDropDelay),
    DeviceCount: parseInt(process.env.DeviceCount || Default.DeviceCount),
    WaittingResultInSecond:
        parseInt(process.env.WaittingResultInSecond || Default.WaittingResultInSecond) * 1000,
} as const;

export { Settings, Account };
