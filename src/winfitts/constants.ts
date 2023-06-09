const Selector = {
    Pratices: {
        Start: ".start.dot",
        Target: ".target.dot",
        Light: { Start: ".start.dot.light", Target: ".target.dot.light" },
    },
    Result: { Table: "#formRemoveRowData > div.block-table > table > tbody" },
} as const;

export { Selector };
