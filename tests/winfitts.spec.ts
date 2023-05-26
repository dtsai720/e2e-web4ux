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
    })

});