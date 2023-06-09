import { URL } from "../http/constants";
import { IResults } from "../result/result";

class DragAndDropResult extends IResults {
    constructor(id: string, steps: number) {
        super(id, steps);
        this.url = [URL.DragAndDropResultPrefix, id].join("/");
    }
}

export { DragAndDropResult };
