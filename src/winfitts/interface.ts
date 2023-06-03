import { Position } from "../math";

interface Resolution {
    Width: number;
    Height: number;
}

interface ClickEvent extends Position {
    Timestamp: number;
}

export { Resolution, ClickEvent };
