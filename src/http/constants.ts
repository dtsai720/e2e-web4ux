import { Settings } from "../config";

const Token = { CSRF: "__RequestVerificationToken" } as const;
const Headers = {
    ContentType: { FROM: "application/x-www-form-urlencoded; charset=UTF-8" },
} as const;

const Method = { POST: "POST", GET: "GET", PUT: "PUT", PATCH: "PATCH" } as const;

const HTML = {
    Attribute: { Value: "value" },
    Label: { Email: "Email", Password: "Password", Account: "Account" },
    Tag: { Table: "table", Tr: "tr", Td: "td", Span: "span" },
    Role: {
        Button: "button",
        ListItem: "listitem",
        Link: "link",
        Name: { Login: "Login", Starts: "Starts", Start: "Start", Finish: "Finish" },
    },
} as const;

const URL = {
    Login: `${Settings.Host}/Home/Login`,
    Home: `${Settings.Host}/Project`,
    CreateProject: `${Settings.Host}/Project/Add`,
    ListProject: `${Settings.Host}/Project/_Projects`,
    FetchDevicePrefix: `${Settings.Host}/Project/Devices`,
    CalibrateDevicePrefix: `${Settings.Host}/Project/DeviceSetting`,
    FetchParticipantPrefix: `${Settings.Host}/Project/Participants`,
    StartPraticePrefix: `${Settings.ExperimentHost}/Login`,
    WinfittsResultPrefix: `${Settings.Host}/Project/WinfittsResult`,
    WinfittsRawDataPrefix: `${Settings.Host}/Project/WinfittsRowData`,
} as const;

export { Headers, Method, URL, Token, HTML };
