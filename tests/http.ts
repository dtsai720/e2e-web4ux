import { Host, ExperimentHost } from "./config";

const ContentType = { FROM: "application/x-www-form-urlencoded; charset=UTF-8" };
const Method = { POST: "POST" };
const Attribute = { Value: "value" };
const Tag = { Table: "table", Tr: "tr", Td: "td", Span: "span" };
const Button = "button";
const CSRFToken = "__RequestVerificationToken";
const Label = { Email: "Email", Password: "Password", Account: "Account" };
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

export { ContentType, Method, Attribute, Button, Tag, Label, URL, CSRFToken };
