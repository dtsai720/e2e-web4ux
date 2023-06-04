import { Settings } from "../config";

import { Default } from "./constants";
import { Project } from "../project/project";
import { CreateProjectParams, Tasks } from "../project/constants";
import { CreateProjectRequest } from "../project/interface";

class CreateProject extends Project {
    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = super.createParams(r);
        params.append(CreateProjectParams.Task.Type, Tasks.Typing);

        params.append(
            CreateProjectParams.Typing.CountdownTimer,
            Settings.Typing.CountdownTimer.toString()
        );
        params.append(CreateProjectParams.Typing.TotalTimer, Settings.Typing.TotalTimer.toString());
        params.append(CreateProjectParams.Typing.FontSize, Default.FontSize.toString());
        params.append(CreateProjectParams.Typing.TextId, Default.TextId);
        return params;
    }
}

export { CreateProject };
