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
const ParticipantCount = parseInt(process.env.ParticipantCount || defaultParticipantCount.toString());
const ModelName = process.env.ModelName || defaultModelName;
const DeviceName = process.env.DeviceName || defaultDeviceName;
const WinfittsFailedRate = parseInt(process.env.WinfittsFailedRate || defaultWinfittsFailedRate.toString());
const EnableTimeSleep = process.env.EnableTimeSleep === 'True';

const ContentType = {
    Form: "application/x-www-form-urlencoded; charset=UTF-8",
};
const Method = {
    Post: "POST",
};
const ProjectStatus = "Draft";
const URL = {
    Login: `${Host}/Home/Login`,
    Home: `${Host}/Project`,
    CreateProject: `${Host}/Project/Add`,
    ListProject: `${Host}/Project/_Projects`,
    FetchDevicePrefix: `${Host}/Project/Devices`,
    CalibrateDevicePrefix: `${Host}/Project/DeviceSetting`,
    FetchParticipantPrefix: `${Host}/Project/Participants`,
    StartWinfittsPrefix: `${ExperimentHost}/Login`,
    WinfittsResultPrefix: `${Host}/Project/WinfittsResult`,
    WinfittsRawDataPrefix: `${Host}/Project/WinfittsRowData`,
};

export {
    Calibrate,
    ContentType,
    DeviceName,
    EnableTimeSleep,
    Email,
    Height,
    Method,
    ModelName,
    Password,
    ParticipantCount,
    ProjectStatus,
    URL,
    Width,
    WinfittsFailedRate,
};
