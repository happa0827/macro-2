"use strict";
/**
 * Centralized uIOhook manager to prevent conflicts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiohookManager = void 0;
const uiohook_napi_1 = require("uiohook-napi");
class UIOhookManager {
    started = false;
    keydownCallbacks = [];
    keyupCallbacks = [];
    mousemoveCallbacks = [];
    mousedownCallbacks = [];
    mouseupCallbacks = [];
    wheelCallbacks = [];
    start() {
        if (this.started)
            return;
        uiohook_napi_1.uIOhook.on('keydown', (e) => {
            this.keydownCallbacks.forEach(cb => cb(e));
        });
        uiohook_napi_1.uIOhook.on('keyup', (e) => {
            this.keyupCallbacks.forEach(cb => cb(e));
        });
        uiohook_napi_1.uIOhook.on('mousemove', (e) => {
            this.mousemoveCallbacks.forEach(cb => cb(e));
        });
        uiohook_napi_1.uIOhook.on('mousedown', (e) => {
            this.mousedownCallbacks.forEach(cb => cb(e));
        });
        uiohook_napi_1.uIOhook.on('mouseup', (e) => {
            this.mouseupCallbacks.forEach(cb => cb(e));
        });
        uiohook_napi_1.uIOhook.on('wheel', (e) => {
            this.wheelCallbacks.forEach(cb => cb(e));
        });
        uiohook_napi_1.uIOhook.start();
        this.started = true;
    }
    stop() {
        if (!this.started)
            return;
        uiohook_napi_1.uIOhook.stop();
        this.started = false;
    }
    onKeyDown(callback) {
        this.keydownCallbacks.push(callback);
    }
    onKeyUp(callback) {
        this.keyupCallbacks.push(callback);
    }
    onMouseMove(callback) {
        this.mousemoveCallbacks.push(callback);
    }
    onMouseDown(callback) {
        this.mousedownCallbacks.push(callback);
    }
    onMouseUp(callback) {
        this.mouseupCallbacks.push(callback);
    }
    onWheel(callback) {
        this.wheelCallbacks.push(callback);
    }
}
exports.uiohookManager = new UIOhookManager();
//# sourceMappingURL=uiohook-manager.js.map