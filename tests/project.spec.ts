import { test, expect } from '@playwright/test';
import { Host } from './config';
import { Login } from './login';
import { GetProjectId } from './project';

test.describe('Validate Project', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

    const timestampInSeconds = Math.floor(Date.now() / 1000);
    const URL = `${Host}/Project/Add`;
    const ProjectName = `Test-${timestampInSeconds}`;
    const ParticipantCount = '1';
    const ModelName = 'a';
    const DeviceName = 'aaa';
    const TypingTotalTimer = '60';
    const CountdownTimer = '60';
    const TextName = 'What Is Yoga?';

    test.skip('Happy Path', async({ page }) => {
        await page.goto(URL);

        await page.waitForSelector('#divStep1');
        await page.locator('#ProjectName').fill(ProjectName);
        await page.locator('#ParticipantCount').fill(ParticipantCount);
        await page.locator('#model-device > div > input.medium-input.modelname').fill(ModelName);
        await page.locator('#model-device > div > input.medium-input.devicename').fill(DeviceName);
        await page.locator('#btnNext').click();

        await page.waitForSelector('#divStep2');
        const step2 = await page.locator('#divStep2 > div.page-block > div.block-content');
        await step2.locator('[data-task="winfitts"]').click();
        await step2.locator('[data-task="dragdrop"]').click();
        await step2.locator('[data-task="typing"]').click();

        await page.locator('#task-orders > div[data-task=winfitts] > div.title > span.icon-toggle.collapse').click();
        await page.locator('#task-orders > div[data-task=typing] > div.title > span.icon-toggle.collapse').click();
        await page.waitForSelector('#task-orders > div[data-task=typing]');

        const typingSelector = await page.locator('#task-orders > div[data-task=typing] > div.body');
        await typingSelector.locator('.typingTotalTimer').fill(TypingTotalTimer);
        await typingSelector.locator('.countdownTimer').fill(CountdownTimer);
        await typingSelector.locator('.btnSelectDocument').click();

        // wait pop-up
        await page.waitForSelector('div.main-content > div.modal.documentup-modal.show > div > div.modal-body');
        await page.locator('div.main-content > div.modal.documentup-modal.show > div > div.modal-body > div.selects-1 > div > div > div').click()
        await page.getByRole('listitem').filter({ hasText: TextName }).click();
        await page.locator('#btnChooseTypingDocument').click();
        await page.locator('#btnNext').click();

        await page.waitForSelector('#divStep3');
        await page.locator('#btnNext').click();

        await page.waitForSelector('#divStep4');
        const actualProjectName = await page.locator('.step4ProjectName').textContent();
        const actualParticipantCount = await page.locator('.step4Participant').textContent();
        const actualModelName = await page.locator('.step4Device > p > span:nth-child(1)').textContent();
        const actualDeviceName = await page.locator('.step4Device > p > span:nth-child(2)').textContent();
        const step4Task = await page.locator('.step4Tasks');
        const actualTypingTotalTimer = await step4Task.locator('div:nth-child(3) > p:nth-child(2) > span').textContent();
        const actualCountdownTimer = await step4Task.locator('div:nth-child(3) > p:nth-child(3) > span').textContent();
        const actualSelectDocument = await step4Task.locator('div:nth-child(3) > p:nth-child(4) > span').textContent();

        expect(actualProjectName).toEqual(ProjectName);
        expect(actualParticipantCount).toEqual(ParticipantCount);
        expect(actualModelName).toEqual(ModelName);
        expect(actualDeviceName).toEqual(DeviceName);
        expect(actualTypingTotalTimer).toEqual(TypingTotalTimer);
        expect(actualCountdownTimer).toEqual(CountdownTimer);
        expect(actualSelectDocument).toEqual(TextName);
    });

    test('GetProjectId', async({ page, context }) => {
        const projectId = await GetProjectId(page, context, {ProjectName: 'Test 2023-03-16', CreatedBy: 'sandy.tu@emric.com.tw'});
        expect(projectId).toEqual('')
    })
});