import { Project } from "./prototype";
import { CreateProjectRequest, IProject } from "./interface";
import { Tasks, CreateProjectParams } from "./constants";

class DragAndDropProject extends Project implements IProject {
    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = super.createParams(r);
        params.append(CreateProjectParams.Task.Type, Tasks.DragAndDrop);
        return params;
    }
}

export { DragAndDropProject };
