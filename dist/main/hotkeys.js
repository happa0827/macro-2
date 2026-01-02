"use strict";
/**
 * Global hotkey listener
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotkeyListener = exports.KEY_F11 = exports.KEY_F10 = exports.KEY_F9 = void 0;
const uiohook_manager_1 = require("./uiohook-manager");
// uiohook key codes for F9, F10, F11
exports.KEY_F9 = 66;
exports.KEY_F10 = 68;
exports.KEY_F11 = 87;
class HotkeyListener {
    running = false;
    initialized = false;
    // Default hotkey settings
    keyRecord = exports.KEY_F9;
    keyPlay = exports.KEY_F10;
    keyStop = exports.KEY_F11;
    // Callbacks
    onRecord;
    onPlay;
    onStop;
    init() {
        if (this.initialized)
            return;
        uiohook_manager_1.uiohookManager.onKeyDown((e) => {
            this.onKeyPress(e.keycode);
        });
        this.initialized = true;
    }
    start() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    onKeyPress(keyCode) {
        if (!this.running)
            return;
        if (keyCode === this.keyRecord && this.onRecord) {
            this.onRecord();
        }
        else if (keyCode === this.keyPlay && this.onPlay) {
            this.onPlay();
        }
        else if (keyCode === this.keyStop && this.onStop) {
            this.onStop();
        }
    }
    setHotkey(action, keyCode) {
        switch (action) {
            case 'record':
                this.keyRecord = keyCode;
                break;
            case 'play':
                this.keyPlay = keyCode;
                break;
            case 'stop':
                this.keyStop = keyCode;
                break;
        }
    }
}
exports.HotkeyListener = HotkeyListener;
//# sourceMappingURL=hotkeys.js.map