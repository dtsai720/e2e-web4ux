import { Host, ExperimentHost } from "./config";

const ContentType = { FROM: "application/x-www-form-urlencoded; charset=UTF-8" } as const;
const Method = { POST: "POST", GET: "GET", PUT: "PUT", PATCH: "PATCH" } as const;
const Attribute = { Value: "value" } as const;
const Tag = { Table: "table", Tr: "tr", Td: "td", Span: "span" } as const;
const Role = {
    Button: "button",
    ListItem: "listitem",
    Link: "link",
    Name: { Login: "Login", Starts: "Starts", Start: "Start", Finish: "Finish" },
} as const;
const CSRFToken = "__RequestVerificationToken";
const Label = { Email: "Email", Password: "Password", Account: "Account" } as const;
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
} as const;

export { ContentType, Method, Attribute, Tag, Label, URL, CSRFToken, Role };
