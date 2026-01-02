/**
 * Mouse/Keyboard event recorder
 */

import { UiohookMouseEvent, UiohookKeyboardEvent, UiohookWheelEvent } from 'uiohook-napi';
import { MacroEvent, EventType, MouseButton } from './events';
import { uiohookManager } from './uiohook-manager';
import { KEY_F9, KEY_F10, KEY_F11 } from './hotkeys';

// Hotkeys to exclude from recording
const EXCLUDED_KEYS = [KEY_F9, KEY_F10, KEY_F11];

export type RecordEventCallback = (event: MacroEvent) => void;

export class Recorder {
  private events: MacroEvent[] = [];
  private startTime: number = 0;
  private recording: boolean = false;
  private initialized: boolean = false;

  public onEvent?: RecordEventCallback;

  get isRecording(): boolean {
    return this.recording;
  }

  getEvents(): MacroEvent[] {
    return [...this.events];
  }

  init(): void {
    if (this.initialized) return;
    this.setupListeners();
    this.initialized = true;
  }

  start(): void {
    if (this.recording) return;

    this.events = [];
    this.startTime = performance.now() / 1000;
    this.recording = true;
  }

  stop(): MacroEvent[] {
    if (!this.recording) return [];

    this.recording = false;
    return this.getEvents();
  }

  destroy(): void {
    // No longer manages uIOhook directly
  }

  private setupListeners(): void {
    uiohookManager.onMouseMove((e: UiohookMouseEvent) => {
      if (!this.recording) return;
      this.addEvent({
        eventType: EventType.MOUSE_MOVE,
        timestamp: this.getTimestamp(),
        x: e.x,
        y: e.y,
      });
    });

    uiohookManager.onMouseDown((e: UiohookMouseEvent) => {
      if (!this.recording) return;
      this.addEvent({
        eventType: EventType.MOUSE_CLICK,
        timestamp: this.getTimestamp(),
        x: e.x,
        y: e.y,
        button: this.convertMouseButton(e.button as number),
        pressed: true,
      });
    });

    uiohookManager.onMouseUp((e: UiohookMouseEvent) => {
      if (!this.recording) return;
      this.addEvent({
        eventType: EventType.MOUSE_CLICK,
        timestamp: this.getTimestamp(),
        x: e.x,
        y: e.y,
        button: this.convertMouseButton(e.button as number),
        pressed: false,
      });
    });

    uiohookManager.onWheel((e: UiohookWheelEvent) => {
      if (!this.recording) return;
      this.addEvent({
        eventType: EventType.MOUSE_SCROLL,
        timestamp: this.getTimestamp(),
        x: e.x,
        y: e.y,
        scrollDx: e.direction === 3 ? e.rotation : 0,
        scrollDy: e.direction === 3 ? 0 : e.rotation,
      });
    });

    uiohookManager.onKeyDown((e: UiohookKeyboardEvent) => {
      if (!this.recording) return;
      if (EXCLUDED_KEYS.includes(e.keycode)) return; // Skip hotkeys
      this.addEvent({
        eventType: EventType.KEY_PRESS,
        timestamp: this.getTimestamp(),
        keyCode: e.keycode,
        keyChar: undefined,
      });
    });

    uiohookManager.onKeyUp((e: UiohookKeyboardEvent) => {
      if (!this.recording) return;
      if (EXCLUDED_KEYS.includes(e.keycode)) return; // Skip hotkeys
      this.addEvent({
        eventType: EventType.KEY_RELEASE,
        timestamp: this.getTimestamp(),
        keyCode: e.keycode,
        keyChar: undefined,
      });
    });
  }

  private getTimestamp(): number {
    return performance.now() / 1000 - this.startTime;
  }

  private addEvent(event: MacroEvent): void {
    this.events.push(event);
    if (this.onEvent) {
      this.onEvent(event);
    }
  }

  private convertMouseButton(button: number): MouseButton {
    switch (button) {
      case 1: return MouseButton.LEFT;
      case 2: return MouseButton.RIGHT;
      case 3: return MouseButton.MIDDLE;
      default: return MouseButton.LEFT;
    }
  }
}
