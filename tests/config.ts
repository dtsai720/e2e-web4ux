import 'dotenv/config';

const defaultWidth = 1920;
const defaultHeight = 1080;
const defaultCalibrate = 4.125;

const Email = process.env.Email || '';
const Password = process.env.Password || '';
const Host = process.env.Host || '';
const Width = parseInt(process.env.Width || defaultWidth.toString());
const Height = parseInt(process.env.Height || defaultHeight.toString());
const Calibrate = parseFloat(process.env.Calibrate || defaultCalibrate.toString());
const ContentType = {
    Form: 'application/x-www-form-urlencoded; charset=UTF-8',
};
const Method = {
    Post: 'POST',
};
const ProjectStatus = 'Draft';
const URL = {
    Login: `${Host}/Home/Login`,
    Home: `${Host}/Project`,
    CreateProject: `${Host}/Project/Add`,
    ListProject: `${Host}/Project/_Projects`,
    FetchDevicePrefix: `${Host}/Project/Devices`,
    CalibrateDevicePrefix: `${Host}/Project/DeviceSetting`,
};

export { Email, Password, Width, Height, Calibrate, ContentType, Method, ProjectStatus, URL };
