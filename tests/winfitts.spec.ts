import { expect, test } from '@playwright/test';

import { Login } from './login';
import { Token } from './csrf';
import { Cookies } from './cookies';
import { WinfittsProject, SetupDevice } from './winfitts';
import { ProjectDetail } from './project';


test.describe('Validate Winfits', () => {
    test.beforeEach(async ({ page }) => {
        await Login(page)
    });

    // TODO: Create Project
    test('Winfits', async({ page, context }) => {
        const token = await Token(page);
        const cookie = await Cookies(context);
        const projectName = 'aaaaaa';
        // await WinfittsProject(page, context, projectName);
        const project = await ProjectDetail(token, cookie, {
            ProjectName: projectName,
            CreatedBy: process.env.Email || ''
        });

        await SetupDevice(token, cookie, project);
        // await page.getByRole('link', { name: 'Model' }).click();
        // const page1Promise = page.waitForEvent('popup');
        // await page.getByRole('link', { name: 'Experiment Link' }).click();
        // const page1 = await page1Promise;
        // await page1.getByLabel('Account').click();
        // await page1.getByLabel('Account').click();
        // await page1.getByLabel('Account').fill('05107');
        // await page1.getByRole('button', { name: 'Starts' }).click();
        // await page1.getByRole('link', { name: 'Start' }).click();
        // await page1.getByRole('button', { name: 'Start' }).click();
        // await page1.locator('#divWinfittsTest span').nth(1).click();
        // await page1.locator('#divWinfittsTest span').first().click();
        // await page1.locator('#divWinfittsTest span').nth(1).click();
        // await page1.locator('#divWinfittsTest span').first().click();
    })

});