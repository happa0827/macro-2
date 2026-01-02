/**
 * Global hotkey listener
 */

import { UiohookKeyboardEvent } from 'uiohook-napi';
import { uiohookManager } from './uiohook-manager';

export type HotkeyCallback = () => void;

// uiohook key codes for F9, F10, F11
export const KEY_F9 = 66;
export const KEY_F10 = 68;
export const KEY_F11 = 87;

export class HotkeyListener {
  private running: boolean = false;
  private initialized: boolean = false;

  // Default hotkey settings
  public keyRecord: number = KEY_F9;
  public keyPlay: number = KEY_F10;
  public keyStop: number = KEY_F11;

  // Callbacks
  public onRecord?: HotkeyCallback;
  public onPlay?: HotkeyCallback;
  public onStop?: HotkeyCallback;

  init(): void {
    if (this.initialized) return;

    uiohookManager.onKeyDown((e: UiohookKeyboardEvent) => {
      this.onKeyPress(e.keycode);
    });

    this.initialized = true;
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  private onKeyPress(keyCode: number): void {
    if (!this.running) return;

    if (keyCode === this.keyRecord && this.onRecord) {
      this.onRecord();
    } else if (keyCode === this.keyPlay && this.onPlay) {
      this.onPlay();
    } else if (keyCode === this.keyStop && this.onStop) {
      this.onStop();
    }
  }

  setHotkey(action: 'record' | 'play' | 'stop', keyCode: number): void {
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
