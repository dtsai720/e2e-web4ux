import { BrowserContext } from "@playwright/test";

const Cookies = async (context: BrowserContext): Promise<string> => {
    const cookies = await context.cookies();
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(";") || "";
};

export { Cookies };
