import { URL, ContentType, Method, ProjectStatus } from './config';

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
    if (array.length < 3) return output;
    output.Id = array[1].replace(pattern.ProjectId, '$1');
    output.Result = array[2].replace(pattern.Result, '$1');
    return output;
}

const ItemStart = 'item draft';
const lastLinePattern = new RegExp(/\<div class\=\"pagination\-row\"\>.*/);

const parseResponse = (text: string): Array<Project> => {
    text = text.split(lastLinePattern)[0]
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

interface fetchProjectRequest {
    ProjectName: string
    CreatedBy: string
};

const defaultOrder = 'ModifyByDesc';
const defaultListType = 'Grid';

const ProjectDetail = async(token: string, cookie: string, request: fetchProjectRequest):
    Promise<Project> => {

    const param = new URLSearchParams();

    param.append('PageNumber', '1');
    param.append('ProjectName', request.ProjectName);
    param.append('Status', ProjectStatus);
    param.append('OrderBy', defaultOrder);
    param.append('CreateBy', request.CreatedBy);
    param.append('ProjectListType', defaultListType);

    const html = await fetch(URL.ListProject, {
        headers: {
            'content-type': ContentType.Form,
            'requestverificationtoken': token,
            'cookie': cookie,
        },
        body: param.toString(),
        method: Method.Post,
    }).then(data => data.text());

    const body = parseResponse(html);
    for (let i = 0; i < body.length; i++) {
        if (body[i].Name === request.ProjectName) return body[i];
    }
    return {Name: '', Id: '', Result: ''};
};

const NewProjectName = (prefix: string, postfix: string): string => {
    const timestamp = Math.floor(Date.now());
    if (prefix === '') prefix = 'All';
    if (postfix === '') return ['Test', prefix, timestamp.toString()].join('-');
    return ['Test', prefix, timestamp.toString(), postfix].join('-');
};

export { ProjectDetail, Project, NewProjectName };