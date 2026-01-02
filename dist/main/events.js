"use strict";
/**
 * Event data structure definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseButton = exports.EventType = void 0;
exports.isMouseEvent = isMouseEvent;
exports.isKeyboardEvent = isKeyboardEvent;
var EventType;
(function (EventType) {
    // Mouse events
    EventType[EventType["MOUSE_MOVE"] = 1] = "MOUSE_MOVE";
    EventType[EventType["MOUSE_CLICK"] = 2] = "MOUSE_CLICK";
    EventType[EventType["MOUSE_SCROLL"] = 3] = "MOUSE_SCROLL";
    // Keyboard events
    EventType[EventType["KEY_PRESS"] = 16] = "KEY_PRESS";
    EventType[EventType["KEY_RELEASE"] = 17] = "KEY_RELEASE";
})(EventType || (exports.EventType = EventType = {}));
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["LEFT"] = 1] = "LEFT";
    MouseButton[MouseButton["RIGHT"] = 2] = "RIGHT";
    MouseButton[MouseButton["MIDDLE"] = 3] = "MIDDLE";
})(MouseButton || (exports.MouseButton = MouseButton = {}));
function isMouseEvent(event) {
    return [EventType.MOUSE_MOVE, EventType.MOUSE_CLICK, EventType.MOUSE_SCROLL].includes(event.eventType);
}
function isKeyboardEvent(event) {
    return [EventType.KEY_PRESS, EventType.KEY_RELEASE].includes(event.eventType);
}
//# sourceMappingURL=events.js.map