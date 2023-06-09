const Selector = {
    File: (idx: number, num: number) => {
        return `#divStep${idx} > div.windowBox > div:nth-child(${num})`;
    },
    Target: (idx: number) => {
        return `#divStep${idx} > div.target.file`;
    },
    Close: (idx: number) => {
        return `#divStep${idx} > div.openWindow.ui-draggable.ui-draggable-handle > button`;
    },
    Window: (idx: number) => {
        return `#divStep${idx} > div.windowBox`;
    },
} as const;

export { Selector };
