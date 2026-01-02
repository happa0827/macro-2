"use strict";
/**
 * Macro playback engine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const nut_js_1 = require("@nut-tree-fork/nut-js");
const events_1 = require("./events");
class Player {
    playing = false;
    stopRequested = false;
    currentLoop = 0;
    totalLoops = 1;
    onStart;
    onStop;
    onLoop;
    onEvent;
    constructor() {
        // Configure nut-js
        nut_js_1.mouse.config.autoDelayMs = 0;
        nut_js_1.keyboard.config.autoDelayMs = 0;
    }
    get isPlaying() {
        return this.playing;
    }
    get currentLoopCount() {
        return this.currentLoop;
    }
    async play(events, loops = 1) {
        if (this.playing || events.length === 0)
            return;
        this.stopRequested = false;
        this.totalLoops = loops;
        this.currentLoop = 0;
        this.playing = true;
        if (this.onStart)
            this.onStart();
        try {
            let loopCount = 0;
            while (!this.stopRequested) {
                loopCount++;
                this.currentLoop = loopCount;
                if (this.onLoop)
                    this.onLoop(loopCount, loops);
                await this.playOnce(events);
                // Check loop count (0 = infinite loop)
                if (loops > 0 && loopCount >= loops)
                    break;
            }
        }
        finally {
            this.playing = false;
            if (this.onStop)
                this.onStop();
        }
    }
    stop() {
        this.stopRequested = true;
    }
    async playOnce(events) {
        if (events.length === 0)
            return;
        const startTime = performance.now() / 1000;
        for (const event of events) {
            if (this.stopRequested)
                break;
            // Timing adjustment: wait until event timestamp
            const targetTime = startTime + event.timestamp;
            const currentTime = performance.now() / 1000;
            if (targetTime > currentTime) {
                await this.sleep((targetTime - currentTime) * 1000);
            }
            if (this.stopRequested)
                break;
            // Execute event
            await this.executeEvent(event);
            if (this.onEvent)
                this.onEvent(event);
        }
    }
    async executeEvent(event) {
        if ((0, events_1.isMouseEvent)(event)) {
            await this.executeMouseEvent(event);
        }
        else if ((0, events_1.isKeyboardEvent)(event)) {
            await this.executeKeyboardEvent(event);
        }
    }
    async executeMouseEvent(event) {
        const point = { x: event.x, y: event.y };
        switch (event.eventType) {
            case events_1.EventType.MOUSE_MOVE:
                await nut_js_1.mouse.setPosition(point);
                break;
            case events_1.EventType.MOUSE_CLICK:
                const button = this.convertButton(event.button);
                await nut_js_1.mouse.setPosition(point);
                if (event.pressed) {
                    await nut_js_1.mouse.pressButton(button);
                }
                else {
                    await nut_js_1.mouse.releaseButton(button);
                }
                break;
            case events_1.EventType.MOUSE_SCROLL:
                await nut_js_1.mouse.setPosition(point);
                if (event.scrollDy) {
                    await nut_js_1.mouse.scrollDown(event.scrollDy > 0 ? event.scrollDy : 0);
                    await nut_js_1.mouse.scrollUp(event.scrollDy < 0 ? -event.scrollDy : 0);
                }
                if (event.scrollDx) {
                    await nut_js_1.mouse.scrollRight(event.scrollDx > 0 ? event.scrollDx : 0);
                    await nut_js_1.mouse.scrollLeft(event.scrollDx < 0 ? -event.scrollDx : 0);
                }
                break;
        }
    }
    async executeKeyboardEvent(event) {
        const key = this.getKeyFromCode(event.keyCode);
        if (!key)
            return;
        if (event.eventType === events_1.EventType.KEY_PRESS) {
            await nut_js_1.keyboard.pressKey(key);
        }
        else {
            await nut_js_1.keyboard.releaseKey(key);
        }
    }
    convertButton(button) {
        switch (button) {
            case events_1.MouseButton.LEFT: return nut_js_1.Button.LEFT;
            case events_1.MouseButton.RIGHT: return nut_js_1.Button.RIGHT;
            case events_1.MouseButton.MIDDLE: return nut_js_1.Button.MIDDLE;
            default: return nut_js_1.Button.LEFT;
        }
    }
    getKeyFromCode(keyCode) {
        // Map uiohook keycodes to nut-js keys
        const keyMap = {
            14: nut_js_1.Key.Backspace,
            15: nut_js_1.Key.Tab,
            28: nut_js_1.Key.Enter,
            42: nut_js_1.Key.LeftShift,
            54: nut_js_1.Key.RightShift,
            29: nut_js_1.Key.LeftControl,
            3613: nut_js_1.Key.RightControl,
            56: nut_js_1.Key.LeftAlt,
            3640: nut_js_1.Key.RightAlt,
            1: nut_js_1.Key.Escape,
            57: nut_js_1.Key.Space,
            3657: nut_js_1.Key.PageUp,
            3665: nut_js_1.Key.PageDown,
            3663: nut_js_1.Key.End,
            3655: nut_js_1.Key.Home,
            57419: nut_js_1.Key.Left,
            57416: nut_js_1.Key.Up,
            57421: nut_js_1.Key.Right,
            57424: nut_js_1.Key.Down,
            3666: nut_js_1.Key.Insert,
            3667: nut_js_1.Key.Delete,
            // Function keys
            59: nut_js_1.Key.F1, 60: nut_js_1.Key.F2, 61: nut_js_1.Key.F3, 62: nut_js_1.Key.F4,
            63: nut_js_1.Key.F5, 64: nut_js_1.Key.F6, 65: nut_js_1.Key.F7, 66: nut_js_1.Key.F8,
            67: nut_js_1.Key.F9, 68: nut_js_1.Key.F10, 87: nut_js_1.Key.F11, 88: nut_js_1.Key.F12,
            // Number keys
            11: nut_js_1.Key.Num0, 2: nut_js_1.Key.Num1, 3: nut_js_1.Key.Num2, 4: nut_js_1.Key.Num3, 5: nut_js_1.Key.Num4,
            6: nut_js_1.Key.Num5, 7: nut_js_1.Key.Num6, 8: nut_js_1.Key.Num7, 9: nut_js_1.Key.Num8, 10: nut_js_1.Key.Num9,
            // Alphabet keys
            30: nut_js_1.Key.A, 48: nut_js_1.Key.B, 46: nut_js_1.Key.C, 32: nut_js_1.Key.D, 18: nut_js_1.Key.E,
            33: nut_js_1.Key.F, 34: nut_js_1.Key.G, 35: nut_js_1.Key.H, 23: nut_js_1.Key.I, 36: nut_js_1.Key.J,
            37: nut_js_1.Key.K, 38: nut_js_1.Key.L, 50: nut_js_1.Key.M, 49: nut_js_1.Key.N, 24: nut_js_1.Key.O,
            25: nut_js_1.Key.P, 16: nut_js_1.Key.Q, 19: nut_js_1.Key.R, 31: nut_js_1.Key.S, 20: nut_js_1.Key.T,
            22: nut_js_1.Key.U, 47: nut_js_1.Key.V, 17: nut_js_1.Key.W, 45: nut_js_1.Key.X, 21: nut_js_1.Key.Y, 44: nut_js_1.Key.Z,
            // Windows/Meta key
            3675: nut_js_1.Key.LeftSuper, 3676: nut_js_1.Key.RightSuper,
        };
        return keyMap[keyCode];
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map