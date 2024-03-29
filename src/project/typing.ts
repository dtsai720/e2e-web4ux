import { Project } from "./prototype";
import { CreateProjectParams, Tasks } from "./constants";
import { CreateProjectRequest, IProject } from "./interface";
import { Settings } from "../config";

const Default = {
    FontSize: 14,
    TextId: "8df33796abcc4eaa89fcc4a2c21933b3",
} as const;

const TypingParams = {
    TotalTimer: "Tasks[0].TypingTotalTimer",
    CountdownTimer: "Tasks[0].TypingCountdownTimer",
    FontSize: "Tasks[0].TypingFontSize",
    TextId: "Tasks[0].TypingTextId",
} as const;

class TypingProject extends Project implements IProject {
    protected createParams(r: CreateProjectRequest): URLSearchParams {
        const params = super.createParams(r);
        params.append(CreateProjectParams.Task.Type, Tasks.Typing);
        params.append(TypingParams.CountdownTimer, Settings.Typing.CountdownTimer.toString());
        params.append(TypingParams.TotalTimer, Settings.Typing.TotalTimer.toString());
        params.append(TypingParams.FontSize, Default.FontSize.toString());
        params.append(TypingParams.TextId, Default.TextId);
        return params;
    }
}

export { TypingProject };
