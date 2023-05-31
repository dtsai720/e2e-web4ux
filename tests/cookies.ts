import { BrowserContext } from "@playwright/test";

const Cookies = async (context: BrowserContext) => {
    const cookies = await context.cookies();
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(";") || "";
};

export { Cookies };
