/**
 * Global hotkey listener
 */
export type HotkeyCallback = () => void;
export declare const KEY_F9 = 66;
export declare const KEY_F10 = 68;
export declare const KEY_F11 = 87;
export declare class HotkeyListener {
    private running;
    private initialized;
    keyRecord: number;
    keyPlay: number;
    keyStop: number;
    onRecord?: HotkeyCallback;
    onPlay?: HotkeyCallback;
    onStop?: HotkeyCallback;
    init(): void;
    start(): void;
    stop(): void;
    private onKeyPress;
    setHotkey(action: 'record' | 'play' | 'stop', keyCode: number): void;
}
//# sourceMappingURL=hotkeys.d.ts.map