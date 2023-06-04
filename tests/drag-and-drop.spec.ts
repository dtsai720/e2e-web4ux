import { test } from "@playwright/test";

import { Login } from "../src/login";
import { DragAndDropComponents } from "../src/helper/dragAndDrop";

test("Drag And Drop", async ({ page, context }) => {
    await Login(page);
    await DragAndDropComponents(page, context);
});
