import { test } from "@playwright/test";

const logger = (description: string) => {
    test.info().annotations.push({ type: "info", description: description });
};

export { logger };
