import "dotenv/config";

const Default = {
    Width: 1920,
    Height: 1080,
    Calibrate: 4.125,
    ParticipantCount: 12,
    ModelName: "model name",
    DeviceName: "device name",
    WinfittsFailedRate: 10,
} as const;

const Email = process.env.Email || "";
const Password = process.env.Password || "";
const Host = process.env.Host || "";
const ExperimentHost = process.env.ExperimentHost || "";
const Width = parseInt(process.env.Width || Default.Width.toString());
const Height = parseInt(process.env.Height || Default.Height.toString());
const Calibrate = parseFloat(process.env.Calibrate || Default.Calibrate.toString());
const ParticipantCount = parseInt(
    process.env.ParticipantCount || Default.ParticipantCount.toString()
);
const ModelName = process.env.ModelName || Default.ModelName;
const DeviceName = process.env.DeviceName || Default.DeviceName;
const WinfittsFailedRate = parseInt(
    process.env.WinfittsFailedRate || Default.WinfittsFailedRate.toString()
);
const EnableTimeSleep = process.env.EnableTimeSleep === "True";
const ProjectStatus = "Draft";

export {
    Host,
    ExperimentHost,
    Calibrate,
    DeviceName,
    EnableTimeSleep,
    Email,
    Height,
    ModelName,
    Password,
    ParticipantCount,
    ProjectStatus,
    Width,
    WinfittsFailedRate,
};
