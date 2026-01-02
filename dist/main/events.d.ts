/**
 * Event data structure definitions
 */
export declare enum EventType {
    MOUSE_MOVE = 1,
    MOUSE_CLICK = 2,
    MOUSE_SCROLL = 3,
    KEY_PRESS = 16,
    KEY_RELEASE = 17
}
export declare enum MouseButton {
    LEFT = 1,
    RIGHT = 2,
    MIDDLE = 3
}
export interface BaseEvent {
    eventType: EventType;
    timestamp: number;
}
export interface MouseEvent extends BaseEvent {
    eventType: EventType.MOUSE_MOVE | EventType.MOUSE_CLICK | EventType.MOUSE_SCROLL;
    x: number;
    y: number;
    button?: MouseButton;
    pressed?: boolean;
    scrollDx?: number;
    scrollDy?: number;
}
export interface KeyboardEvent extends BaseEvent {
    eventType: EventType.KEY_PRESS | EventType.KEY_RELEASE;
    keyCode: number;
    keyChar?: string;
}
export type MacroEvent = MouseEvent | KeyboardEvent;
export declare function isMouseEvent(event: MacroEvent): event is MouseEvent;
export declare function isKeyboardEvent(event: MacroEvent): event is KeyboardEvent;
//# sourceMappingURL=events.d.ts.map