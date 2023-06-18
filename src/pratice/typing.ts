import { Page } from "@playwright/test";

import { Pratice } from "./prototype";
import { Device, Participant } from "../project/interface";
import { TypingPraticeDetails } from "./interface";
import { HTML } from "../http/constants";
import { Settings } from "../config";

const Selector = {
    Textarea: "#textarea",
    TextBox: "body > div.tping-test > div.queBox > div",
    Finish: "#btnFinish",
} as const;

const Press = {
    Esc: "Escape",
    Delete: "Delete",
    Enter: "Enter",
    Space: "Space",
} as const;

const Pattern = {
    Space: new RegExp(/^\s*$/),
    English: new RegExp(/[a-zA-Z]+/g),
} as const;

const TypingEvent = {
    MouseMove: (num: number) => {
        return `Mouse move(${num})`;
    },
    WordSelected: (num: number) => {
        return `Select(${num})`;
    },
    Press: (count: number) => {
        return `Key press(${count})`;
    },
    Function: (num: number) => {
        return `Key function(${num})`;
    },
    DoubleClick: (num: number) => {
        return `Double click(${num})`;
    },
} as const;

class TypingPratice extends Pratice {
    private isSpace(word: string) {
        return Pattern.Space.test(word);
    }

    private selectedWord(words: string) {
        const matches = words.match(Pattern.English);
        const dictionary: Record<string, number> = {};
        if (matches === null) throw new Error("");
        for (let i = 0; i < matches.length; i++) {
            const key = matches[i];
            if (key.length === 1) continue;
            if (dictionary[key] === undefined) dictionary[key] = 0;
            dictionary[key]++;
        }

        const candidates: { Word: string; Count: number }[] = [];
        for (const word in dictionary) {
            candidates.push({ Word: word, Count: dictionary[word] });
        }

        candidates.sort((a, b) => b.Count - a.Count);
        const maxIdx = candidates.length > 5 ? 5 : candidates.length;
        const idx = Math.round(Math.random() * 100) % maxIdx;
        return candidates[idx].Word;
    }

    private async prepareArticle(page: Page) {
        const texts: string[] = [];
        for (const li of await page.locator(Selector.TextBox).all()) {
            texts.push((await li.innerText()) || "");
        }
        const Article = texts.join("").split("\n");
        const SelectedWord = this.selectedWord(texts.join(""));
        return { Article, SelectedWord };
    }

    async startOne(page: Page, deviceId: string, account: string) {
        await super.prepare(page, deviceId, account);
        const { Article, SelectedWord } = await this.prepareArticle(page);
        const output: TypingPraticeDetails = {
            Account: account,
            CorrectChars: 0,
            WrongChars: 0,
            TypingTime: 0,
            Details: [],
        };
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.StartTyping }).click();

        const StartTimestamp = Date.now();

        if (Math.random() * 100 > 50) {
            // Mouse move event
            await page.mouse.move(0, 0);
            output.Details.push({ Event: TypingEvent.MouseMove(1), Details: [] });
        }

        const locator = page.locator(Selector.Textarea);
        await locator.focus();
        let currentText = "";
        const contexts: string[] = [];
        const lastChar = SelectedWord[SelectedWord.length - 1];
        for (let i = 0; i < Article.length; i++) {
            for (let j = 0; j < Article[i].length; j++) {
                const charCode = Article[i][j].charCodeAt(0);
                let char = Article[i][j];
                if (char != lastChar && Math.random() * 100 > 95) {
                    output.WrongChars++;
                    char = String.fromCharCode(charCode + 1);
                }

                currentText += char;
                if (this.isSpace(char)) {
                    await locator.press(Press.Space);
                    if (Date.now() - StartTimestamp > Settings.Typing.Time) break;
                } else await locator.type(char, { delay: Settings.Typing.Delay });

                if (currentText.includes(SelectedWord)) {
                    const size = SelectedWord.length;
                    contexts.push(currentText);
                    // Dblclick
                    const text = contexts.join("");
                    if (contexts.length !== 1) currentText = `${SelectedWord}${currentText}`;
                    output.Details.push({
                        Event: TypingEvent.Press(currentText.length),
                        Details: [currentText, text],
                    });

                    await locator.click({ clickCount: 2 });
                    output.Details.push({ Event: TypingEvent.DoubleClick(1), Details: [] });
                    output.Details.push({
                        Event: TypingEvent.WordSelected(1),
                        Details: [SelectedWord, text],
                    });

                    await locator.press(Press.Delete);
                    output.Details.push({
                        Event: TypingEvent.Function(1),
                        Details: [Press.Delete, text.slice(0, -size)],
                    });

                    for (let w = 0; w < size; w++) {
                        await locator.type(SelectedWord[w], { delay: Settings.Typing.Delay });
                    }
                    currentText = "";
                }
            }
            if (Date.now() - StartTimestamp > Settings.Typing.Time) break;
            //
            currentText += "\n";
            await locator.press(Press.Enter);
        }
        // Press ESC
        await locator.press(Press.Esc);

        contexts.push(currentText);
        if (contexts.length !== 1) currentText = `${SelectedWord}${currentText}`;
        output.Details.push({
            Event: TypingEvent.Press(currentText.length),
            Details: [currentText, contexts.join("")],
        });
        output.Details.push({ Event: TypingEvent.Function(1), Details: [Press.Esc] });

        await page.waitForSelector(Selector.Finish);
        await page.getByRole(HTML.Role.Button, { name: HTML.Role.Name.Finish }).click();
        output.TypingTime = Date.now() - StartTimestamp;
        output.CorrectChars = contexts.join("").length - output.WrongChars;
        return output;
    }

    async start(page: Page, devices: Device[], participants: Participant[]) {
        const output: Record<string, Record<string, TypingPraticeDetails>> = {};
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const key = `${device.ModelName}-${device.DeviceName}`;
            for (let j = 0; j < participants.length; j++) {
                const account = participants[j].Account;
                if (output[account] === undefined) output[account] = {};
                output[account][key] = await this.startOne(page, device.Id, account);
            }
        }
        return output;
    }
}

export { TypingPratice };
