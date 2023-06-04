const Selector = {
    File: (idx: number, num: number) => {
        return `#divStep${idx} > div.windowBox > div:nth-child(${num})`;
    },
    Target: (idx: number) => {
        return `#divStep${idx} > div.target.file`;
    },
} as const;

export { Selector };
