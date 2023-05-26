import { Host } from './config';

interface Project {
    Name: string
    Result: string
    Id: string
}

const pattern = {
    ProjectId: new RegExp(/\<a href=\"\/Project\/Devices\/([^\"]+)\".+>.+/),
    Result: new RegExp(/\<a href=\"\/Project\/.+Result\/([^\"]+)\".+>.+/),
}

const handleArray = (array: Array<string>): Project => {
    const output: Project = {Name: '', Result: '', Id: ''};
    while (array.length !== 0 && array[0] !== '<div class=\"name\">') array.shift();
    array.shift();
    output.Name = array.shift() || '';
    while (array.length !== 0 && !array[0].startsWith('<div class=\"tool\">')) array.shift();
    output.Id = array[1].replace(pattern.ProjectId, '$1');
    output.Result = array[2].replace(pattern.Result, '$1');
    return output;
}

const ItemStart = 'item draft';

const parseResponse = (text: string): Array<Project> => {
    text = text.split(new RegExp(/\<div class\=\"pagination\-row\"\>.*/))[0]
    const array: Array<string> = [];
    text.split('\n').forEach(body => {
        if (body.trim() === '') return;
        array.push(body.trim());
    });

    const output: Array<Project> = [];
    while(array.length !== 0) {
        const sentence = array.shift() || '';
        if (!sentence.includes(ItemStart)) {
            continue;
        }

        const candidate: Array<string> = [];
        while (array.length !== 0 && !array[0].includes(ItemStart)) {
            candidate.push(array.shift() || '');
        }

        if (candidate.length !== 0) output.push(handleArray(candidate));
    }
    return output;
}

interface Request {
    ProjectName: string
    CreatedBy: string
}

const ProjectDetail = async(token: string, cookie: string, request: Request): Promise<Project> => {
    const URL = `${Host}/Project/_Projects`;

    const param = new URLSearchParams();
    param.append('PageNumber', '1');
    param.append('ProjectName', request.ProjectName);
    param.append('Status', 'Draft');
    param.append('OrderBy', 'ModifyByDesc');
    param.append('CreateBy', request.CreatedBy);
    param.append('ProjectListType', 'Grid');

    const html = await fetch(URL, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'requestverificationtoken': token,
            'cookie': cookie,
        },
        body: param.toString(),
        method: 'POST',
    }).then(data => data.text());

    const body = parseResponse(html);
    for (let i = 0; i < body.length; i++) {
        if (body[i].Name === request.ProjectName) return body[i];
    }
    return {Name: '', Id: '', Result: ''};
};

export { ProjectDetail, Project };