import "dotenv/config";

const defaultWidth = 1920;
const defaultHeight = 1080;
const defaultCalibrate = 4.125;
const defaultParticipantCount = 12;
const defaultModelName = "model name";
const defaultDeviceName = "device name";
const defaultWinfittsFailedRate = 10;

const Email = process.env.Email || "";
const Password = process.env.Password || "";
const Host = process.env.Host || "";
const ExperimentHost = process.env.ExperimentHost || "";
const Width = parseInt(process.env.Width || defaultWidth.toString());
const Height = parseInt(process.env.Height || defaultHeight.toString());
const Calibrate = parseFloat(process.env.Calibrate || defaultCalibrate.toString());
const ParticipantCount = parseInt(
    process.env.ParticipantCount || defaultParticipantCount.toString()
);
const ModelName = process.env.ModelName || defaultModelName;
const DeviceName = process.env.DeviceName || defaultDeviceName;
const WinfittsFailedRate = parseInt(
    process.env.WinfittsFailedRate || defaultWinfittsFailedRate.toString()
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
