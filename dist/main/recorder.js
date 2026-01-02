"use strict";
/**
 * Mouse/Keyboard event recorder
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recorder = void 0;
const events_1 = require("./events");
const uiohook_manager_1 = require("./uiohook-manager");
const hotkeys_1 = require("./hotkeys");
// Hotkeys to exclude from recording
const EXCLUDED_KEYS = [hotkeys_1.KEY_F9, hotkeys_1.KEY_F10, hotkeys_1.KEY_F11];
class Recorder {
    events = [];
    startTime = 0;
    recording = false;
    initialized = false;
    onEvent;
    get isRecording() {
        return this.recording;
    }
    getEvents() {
        return [...this.events];
    }
    init() {
        if (this.initialized)
            return;
        this.setupListeners();
        this.initialized = true;
    }
    start() {
        if (this.recording)
            return;
        this.events = [];
        this.startTime = performance.now() / 1000;
        this.recording = true;
    }
    stop() {
        if (!this.recording)
            return [];
        this.recording = false;
        return this.getEvents();
    }
    destroy() {
        // No longer manages uIOhook directly
    }
    setupListeners() {
        uiohook_manager_1.uiohookManager.onMouseMove((e) => {
            if (!this.recording)
                return;
            this.addEvent({
                eventType: events_1.EventType.MOUSE_MOVE,
                timestamp: this.getTimestamp(),
                x: e.x,
                y: e.y,
            });
        });
        uiohook_manager_1.uiohookManager.onMouseDown((e) => {
            if (!this.recording)
                return;
            this.addEvent({
                eventType: events_1.EventType.MOUSE_CLICK,
                timestamp: this.getTimestamp(),
                x: e.x,
                y: e.y,
                button: this.convertMouseButton(e.button),
                pressed: true,
            });
        });
        uiohook_manager_1.uiohookManager.onMouseUp((e) => {
            if (!this.recording)
                return;
            this.addEvent({
                eventType: events_1.EventType.MOUSE_CLICK,
                timestamp: this.getTimestamp(),
                x: e.x,
                y: e.y,
                button: this.convertMouseButton(e.button),
                pressed: false,
            });
        });
        uiohook_manager_1.uiohookManager.onWheel((e) => {
            if (!this.recording)
                return;
            this.addEvent({
                eventType: events_1.EventType.MOUSE_SCROLL,
                timestamp: this.getTimestamp(),
                x: e.x,
                y: e.y,
                scrollDx: e.direction === 3 ? e.rotation : 0,
                scrollDy: e.direction === 3 ? 0 : e.rotation,
            });
        });
        uiohook_manager_1.uiohookManager.onKeyDown((e) => {
            if (!this.recording)
                return;
            if (EXCLUDED_KEYS.includes(e.keycode))
                return; // Skip hotkeys
            this.addEvent({
                eventType: events_1.EventType.KEY_PRESS,
                timestamp: this.getTimestamp(),
                keyCode: e.keycode,
                keyChar: undefined,
            });
        });
        uiohook_manager_1.uiohookManager.onKeyUp((e) => {
            if (!this.recording)
                return;
            if (EXCLUDED_KEYS.includes(e.keycode))
                return; // Skip hotkeys
            this.addEvent({
                eventType: events_1.EventType.KEY_RELEASE,
                timestamp: this.getTimestamp(),
                keyCode: e.keycode,
                keyChar: undefined,
            });
        });
    }
    getTimestamp() {
        return performance.now() / 1000 - this.startTime;
    }
    addEvent(event) {
        this.events.push(event);
        if (this.onEvent) {
            this.onEvent(event);
        }
    }
    convertMouseButton(button) {
        switch (button) {
            case 1: return events_1.MouseButton.LEFT;
            case 2: return events_1.MouseButton.RIGHT;
            case 3: return events_1.MouseButton.MIDDLE;
            default: return events_1.MouseButton.LEFT;
        }
    }
}
exports.Recorder = Recorder;
//# sourceMappingURL=recorder.js.map