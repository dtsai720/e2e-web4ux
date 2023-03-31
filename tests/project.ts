import { expect, Page, BrowserContext } from '@playwright/test';

interface item {
    name: string
    setting: string
    result: string
    projectId: string
}

const pattern = {
    setting: new RegExp(/\<a href=\"(\/Project\/BasiceSetting\/[^\"]+)\".+>.+/),
    result: new RegExp(/\<a href=\"(\/Project\/Result\/[^\"]+)\".+>.+/),
    pattern: new RegExp(/\<div class\=\"([^\"]+)\"\>/),
    projectId: new RegExp(/\<a href=\"\/Project\/BasiceSetting\/([^\"]+)\".+>.+/),
}

const handleArray = (array: Array<string>): item => {
    let output: item = {name: '', setting: '', result: '', projectId: ''};
    while (array.length > 0 && array[0] !== '<div class="name">') array.shift();
    array.shift();
    const name = array.shift();
    if (name !== undefined) output.name = name;
    while (array.length > 0 && !array[0].startsWith('<a href="/Project/BasiceSetting')) array.shift();
    const setting = array.shift();
    if (setting !== undefined) output.setting = setting.replace(pattern.setting, '$1');
    if (setting !== undefined) output.projectId = setting.replace(pattern.projectId, '$1');
    while (array.length > 0 && !array[0].startsWith('<a href="/Project/Result')) array.shift();
    const result = array.shift();
    if (result !== undefined) output.result = result.replace(pattern.result, '$1');
    return output;
}

const parseResponse = (text: string): Array<item> => {
    text = text.split(new RegExp(/\<div class\=\"pagination\-row\"\>.*/))[0]
    const array: Array<string> = [];
    text.split('\n').forEach(body => {
        if (body.trim() === '') return;
        array.push(body.trim());
    });
    array.shift();

    const output: Array<item> = [];
    while(array.length > 1) {
        const candidate = [array.shift() || ''];
        while (array.length > 2) {
            const matches = array[0].replace(pattern.pattern, '$1');
            if (matches === 'item draft') break;
            candidate.push(array.shift() || '');
        }
        candidate.length > 1 && output.push(handleArray(candidate));
    }
    return output;
}

interface GetProjectIdRequest {
    ProjectName: string
    CreatedBy: string
}

const GetProjectId = async( page: Page, context: BrowserContext, request: GetProjectIdRequest ): Promise<string> => {
    const token = await page.locator('input[name=__RequestVerificationToken]');
    const tokenValue = await token.getAttribute('value');
    expect(token).not.toEqual('');

    const cookies = await context.cookies();
    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    expect(cookieString).not.toEqual('');

    const param = new URLSearchParams();
    param.append('PageNumber', '1');
    param.append('ProjectName', request.ProjectName);
    param.append('Status', 'Draft');
    param.append('OrderBy', 'ModifyByDesc');
    param.append('CreateBy', request.CreatedBy);
    param.append('ProjectListType', '');

    const html = await fetch("https://stage-backend-web4ux.azurewebsites.net/Project/_Projects", {
        "headers": {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "requestverificationtoken": tokenValue || '',
            "cookie": cookieString,
        },
        "body": param.toString(),
        "method": "POST"
    }).then(data => data.text());

    const body = parseResponse(html);
    let validate = false;
    let projectId = '';
    body.forEach(element => {
        if (element.name === request.ProjectName) {
            validate = true;
            projectId = element.projectId;
        }
    });
    return validate? projectId: '';
};

export { GetProjectId }