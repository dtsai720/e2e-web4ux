import { test, expect } from "@playwright/test";

import { Settings } from "../src/config";
import { URL, HTML } from "../src/http/constants";
import { Login } from "../src/login";
import { NewProjectName } from "../src/project/prototype";

const ExpandSettingPostfix = "div.title > span.icon-toggle.collapse";
const DocumentPopUP = "div.main-content > div.modal.documentup-modal.show > div > div.modal-body";
const prefix = "ALL";

const Input = {
    ParticipantCount: Settings.ParticipantCount.toString(),
    ModelName: "ModelName",
    DeviceName: "DeviceName",
    TotalTimer: "1",
    CountdownTimer: "60",
    TextName: "What Is Yoga?",
} as const;

const Selector = {
    WaitFor: {
        Page1: "#divStep1",
        Page2: "#divStep2",
        Page3: "#divStep3",
        Page4: "#divStep4",
    },
    Page1: {
        ProjectName: "#ProjectName",
        ParticipantCount: "#ParticipantCount",
        ModelName: "#model-device > div > input.medium-input.modelname",
        DeviceName: "#model-device > div > input.medium-input.devicename",
    },
    Page2: {
        TaskContent: "#divStep2 > div.page-block > div.block-content",
        Task: {
            Winfitts: '[data-task="winfitts"]',
            DragAnddrop: '[data-task="dragdrop"]',
            Typing: '[data-task="typing"]',
        },
        ExpandSetting: {
            Winfitts: `#task-orders > div[data-task="winfitts"] > ${ExpandSettingPostfix}`,
            Typing: `#task-orders > div[data-task="typing"] > ${ExpandSettingPostfix}`,
        },
        Typing: {
            WaitFor: '#task-orders > div[data-task="typing"]',
            Body: '#task-orders > div[data-task="typing"] > div.body',
            TotalTimer: ".typingTotalTimer",
            CountdownTimer: ".countdownTimer",
            Document: {
                Start: ".btnSelectDocument",
                PopUp: DocumentPopUP,
                Select: `${DocumentPopUP} > div.selects-1 > div > div > div`,
                Choose: "#btnChooseTypingDocument",
            },
        },
    },
    Page4: {
        ProjectName: ".step4ProjectName",
        Participant: ".step4Participant",
        ModelName: ".step4Device > p > span:nth-child(1)",
        DeviceName: ".step4Device > p > span:nth-child(2)",
        Tasks: ".step4Tasks",
        Typing: {
            TotalTimer: "div:nth-child(3) > p:nth-child(2) > span",
            CountdownTimer: "div:nth-child(3) > p:nth-child(3) > span",
            SelecteDocument: "div:nth-child(3) > p:nth-child(5) > span",
        },
    },
    NextButton: "#btnNext",
} as const;

test.describe("Validate Project", () => {
    test.beforeEach(async ({ page }) => {
        await Login(page);
    });

    test("Happy Path", async ({ page }) => {
        const ProjectName = NewProjectName(prefix, "");
        await page.goto(URL.CreateProject);

        await page.waitForSelector(Selector.WaitFor.Page1);
        await page.locator(Selector.Page1.ProjectName).fill(ProjectName);
        await page.locator(Selector.Page1.ParticipantCount).fill(Input.ParticipantCount);
        await page.locator(Selector.Page1.ModelName).fill(Input.ModelName);
        await page.locator(Selector.Page1.DeviceName).fill(Input.DeviceName);
        await page.locator(Selector.NextButton).click();

        await page.waitForSelector(Selector.WaitFor.Page2);
        const step2 = await page.locator(Selector.Page2.TaskContent);
        await step2.locator(Selector.Page2.Task.Winfitts).click();
        await step2.locator(Selector.Page2.Task.DragAnddrop).click();
        await step2.locator(Selector.Page2.Task.Typing).click();

        await page.locator(Selector.Page2.ExpandSetting.Winfitts).click();
        await page.locator(Selector.Page2.ExpandSetting.Typing).click();
        await page.waitForSelector(Selector.Page2.Typing.WaitFor);

        const typing = await page.locator(Selector.Page2.Typing.Body);
        await typing.locator(Selector.Page2.Typing.TotalTimer).fill(Input.TotalTimer);
        await typing.locator(Selector.Page2.Typing.CountdownTimer).fill(Input.CountdownTimer);
        await typing.locator(Selector.Page2.Typing.Document.Start).click();

        await page.waitForSelector(Selector.Page2.Typing.Document.PopUp);
        await page.locator(Selector.Page2.Typing.Document.Select).click();
        await page.getByRole(HTML.Role.ListItem).filter({ hasText: Input.TextName }).click();
        await page.locator(Selector.Page2.Typing.Document.Choose).click();
        await page.locator(Selector.NextButton).click();

        await page.waitForSelector(Selector.WaitFor.Page3);
        await page.locator(Selector.NextButton).click();

        await page.waitForSelector(Selector.WaitFor.Page4);

        const tasks = await page.locator(Selector.Page4.Tasks);
        const Output = {
            ProjectName: await page.locator(Selector.Page4.ProjectName).textContent(),
            ParticipantCount: await page.locator(Selector.Page4.Participant).textContent(),
            ModelName: await page.locator(Selector.Page4.ModelName).textContent(),
            DeviceName: await page.locator(Selector.Page4.DeviceName).textContent(),
            TotalTimer: await tasks.locator(Selector.Page4.Typing.TotalTimer).textContent(),
            CountdownTimer: await tasks.locator(Selector.Page4.Typing.CountdownTimer).textContent(),
            TextName: await tasks.locator(Selector.Page4.Typing.SelecteDocument).textContent(),
        };

        expect(Output.ProjectName).toEqual(ProjectName);
        expect(Output.ParticipantCount).toEqual(Input.ParticipantCount);
        expect(Output.ModelName).toEqual(Input.ModelName);
        expect(Output.DeviceName).toEqual(Input.DeviceName);
        expect(Output.TotalTimer).toEqual(Input.TotalTimer);
        expect(Output.CountdownTimer).toEqual(Input.CountdownTimer);
        expect(Output.TextName).toContain(Input.TextName);
    });
});
