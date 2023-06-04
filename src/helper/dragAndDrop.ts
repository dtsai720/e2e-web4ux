import { Page, BrowserContext } from "@playwright/test";

import { CreateProject } from "../dragAndDrop/project";
import { Participant } from "../project/interface";
import { CreateProjectRequirements } from "./helper";
import { Pratice } from "./pratice";
import { IPratice } from "./interface";
import { DragAndDorpPratices } from "../dragAndDrop/pratice";

const ProjectName = {
    Prefix: "DragAndDrop",
    Postfix: "",
} as const;

class DragAndDrop extends Pratice implements IPratice {
    async pratice(page: Page, participants: ReadonlyArray<Participant>): Promise<any> {
        const pratices = new DragAndDorpPratices(this.device);
        for (let i = 0; i < participants.length; i++) {
            await pratices.start(page, participants[i]);
        }
    }
}

const DragAndDropComponents = async (page: Page, context: BrowserContext) => {
    const requirements = await CreateProjectRequirements(page, context, ProjectName);
    const project = new CreateProject(requirements.Token, requirements.Cookie);
    const dragAndDrop = new DragAndDrop(project);
    await dragAndDrop.setup(page, requirements.Request);
    const participants = await dragAndDrop.participants(page);
    const Pratices = await dragAndDrop.pratice(page, participants);
    return { Pratices };
};

export { DragAndDropComponents };
