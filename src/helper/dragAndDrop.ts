import { Page, BrowserContext } from "@playwright/test";

import { CreateProject } from "../dragAndDrop/project";
import { Participant } from "../project/interface";
import { CreateProjectRequirements } from "./helper";
import { Pratice } from "./pratice";
import { IPratice } from "./interface";
import { DragAndDorpPratices } from "../dragAndDrop/pratice";
import { DragAndDropRawData } from "../dragAndDrop/rawdata";
import { DragAndDropResult } from "../dragAndDrop/result";
import { PraticeResult } from "../project/interface";

const ProjectName = {
    Prefix: "DragAndDrop",
    Postfix: "",
} as const;

class DragAndDrop extends Pratice implements IPratice {
    async pratice(page: Page, participants: ReadonlyArray<Participant>) {
        const pratices = new DragAndDorpPratices(this.device);
        const output: PraticeResult[] = [];
        for (let i = 0; i < participants.length; i++) {
            output.push(await pratices.start(page, participants[i]));
        }
        return output;
    }
}

const DragAndDropComponents = async (page: Page, context: BrowserContext) => {
    const requirements = await CreateProjectRequirements(page, context, ProjectName);
    const project = new CreateProject(requirements.Token, requirements.Cookie);
    const dragAndDrop = new DragAndDrop(project);
    await dragAndDrop.setup(page, requirements.Request);
    const participants = await dragAndDrop.participants(page);
    const Pratices = await dragAndDrop.pratice(page, participants);
    const Rawdata = await new DragAndDropRawData(dragAndDrop.ResultId()).fetchAll(page);
    const Result = await new DragAndDropResult(dragAndDrop.ResultId()).fetch(page);
    return { Pratices, Rawdata, Result } as const;
};

export { DragAndDropComponents };
