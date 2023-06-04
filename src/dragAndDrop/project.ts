import { Project } from "../project/project";
import { CreateProjectParams, Tasks } from "../project/constants";
import { CreateProjectRequest } from "../project/interface";

class CreateProject extends Project {
    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = super.createParams(r);
        params.append(CreateProjectParams.Task.Type, Tasks.DragAndDrop);
        return params;
    }
}

export { CreateProject };
