import { Position } from "../math";

interface Resolution {
    Width: number;
    Height: number;
}

interface ClickEvent extends Position {
    Timestamp: number;
}

interface detail extends ClickEvent {
    EventType: string;
}

interface RawDataDetail {
    Title: {
        TrailNumber: number;
        IsFailed: boolean;
        ErrorTime: number;
        Width: number;
        Distance: number;
        Id: number;
        Angle: number;
        EventTime: number;
    };
    Detail: Array<detail>;
}

export { Resolution, ClickEvent, RawDataDetail };
