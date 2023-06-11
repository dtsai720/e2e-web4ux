const EventType = {
    DobuleClick: "Double click",
    DragAndDrop: "Drag and drop",
} as const;

const DragSide = {
    Folder: "folder",
    Overshot: "overshot",
    Desktop: "desktop",
    Target: "target",
} as const;

export { EventType, DragSide };
