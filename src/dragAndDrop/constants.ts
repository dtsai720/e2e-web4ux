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
    RawData: {
        Table: "#divData",
        Head: "div.data1 > span",
        Row: "div.data1-pack",
        TrailPack: "div.data2-pack",
        SimpleRow: "div.data2 > span",
        ClickResults: "div.data3",
    },
} as const;

export { Selector };
