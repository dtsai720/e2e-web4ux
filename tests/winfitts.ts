import { Host } from "./config";
import { Project } from './project';

const WinfittsProject = async (token: string, cookie: string, projectName: string) => {
    const URL = `${Host}/Project/Add`;
    const param = new URLSearchParams();

    param.append('ProjectName', projectName);
    param.append('ParticipantCount', '1');
    param.append('Devices[0].ModelName', 'a');
    param.append('Devices[0].DeviceName', 'a');
    param.append('Devices[0].Sort', '0');
    param.append('Tasks[0].TaskType', 'Winfitts');
    param.append('Tasks[0].Sort', '0');
    param.append('Tasks[0].TrailsTestRound', '1');

    param.append('Tasks[0].WinfittsSettings[0].Width', '3');
    param.append('Tasks[0].WinfittsSettings[0].Distance', '150');
    param.append('Tasks[0].WinfittsSettings[0].Sort', '0');
    param.append('Tasks[0].WinfittsSettings[0].Difficulty', '5.7');

    param.append('Tasks[0].WinfittsSettings[1].Width', '15');
    param.append('Tasks[0].WinfittsSettings[1].Distance', '150');
    param.append('Tasks[0].WinfittsSettings[1].Sort', '1');
    param.append('Tasks[0].WinfittsSettings[1].Difficulty', '3.5');

    param.append('Tasks[0].WinfittsSettings[2].Width', '3');
    param.append('Tasks[0].WinfittsSettings[2].Distance', '30');
    param.append('Tasks[0].WinfittsSettings[2].Sort', '2');
    param.append('Tasks[0].WinfittsSettings[2].Difficulty', '3.5');

    param.append('Tasks[0].WinfittsSettings[0].Width', '15');
    param.append('Tasks[0].WinfittsSettings[0].Distance', '30');
    param.append('Tasks[0].WinfittsSettings[0].Sort', '3');
    param.append('Tasks[0].WinfittsSettings[0].Difficulty', '1.6');

    param.append('WinfittsPracticeTrails', '');
    param.append('DragAndDropPracticeTrails', '');
    param.append('TypingPractice', '');

    param.append('__RequestVerificationToken', token)

    await fetch(URL, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie,
        },
        body: param.toString(),
        method: "POST"
    });
};

const SetupDevice = async(token: string, cookie: string, project: Project) => {
    const URL = `${Host}/Project/DeviceSetting/${project.Id}`;
    const param = new URLSearchParams();

    param.append('ProjectId', project.Id);
    param.append('ProjectName', project.Name);
    // param.append('CreateTime', '5/26/2023+9:40:40+AM++00:00)
    param.append('ProjectStauts', 'Draft');
    param.append('DeviceId', '922b17008c304c07bda137be23524709');
    param.append('ModelName', 'b');
    param.append('DeviceName', 'b');
    param.append('Calibrate', '4.125');

    param.append('DeviceWidth', '1920');
    param.append('DeviceHeight', '1080');

    param.append('InnerWidth', '1920');
    param.append('InnerHeight', '1080');

    param.append('OuterWidth', '1920');
    param.append('OuterHeight', '1080');
    param.append('__RequestVerificationToken', token);

    await fetch(URL, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie,
        },
        body: param.toString(),
        method: 'POST',
    });
}

export { WinfittsProject, SetupDevice };