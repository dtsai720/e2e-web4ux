import { test } from "@playwright/test";

import { Settings } from "../src/config";
import { Login } from "../src/login";
import { DragAndDropComponents } from "../src/helper/dragAndDrop";

test.skip("Drag And Drop", async ({ page, context }) => {
    await Login(page);
    await page.setViewportSize({
        width: Settings.Width,
        height: Settings.Height,
    });
    const components = await DragAndDropComponents(page, context);
});
