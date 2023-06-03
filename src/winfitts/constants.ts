const Selector = {
    Pratices: {
        Start: ".start.dot",
        Target: ".target.dot",
        Light: { Start: ".start.dot.light", Target: ".target.dot.light" },
    },
    Result: { Table: "#formRemoveRowData > div.block-table > table > tbody" },
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
