/**
 * Centralized uIOhook manager to prevent conflicts
 */
import { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi';
declare class UIOhookManager {
    private started;
    private keydownCallbacks;
    private keyupCallbacks;
    private mousemoveCallbacks;
    private mousedownCallbacks;
    private mouseupCallbacks;
    private wheelCallbacks;
    start(): void;
    stop(): void;
    onKeyDown(callback: (e: UiohookKeyboardEvent) => void): void;
    onKeyUp(callback: (e: UiohookKeyboardEvent) => void): void;
    onMouseMove(callback: (e: UiohookMouseEvent) => void): void;
    onMouseDown(callback: (e: UiohookMouseEvent) => void): void;
    onMouseUp(callback: (e: UiohookMouseEvent) => void): void;
    onWheel(callback: (e: UiohookWheelEvent) => void): void;
}
export declare const uiohookManager: UIOhookManager;
export {};
//# sourceMappingURL=uiohook-manager.d.ts.map