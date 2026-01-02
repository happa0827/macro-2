/**
 * Macro playback engine
 */

import { mouse, keyboard, Point, Button, Key } from '@nut-tree-fork/nut-js';
import { MacroEvent, EventType, MouseButton, isMouseEvent, isKeyboardEvent, MouseEvent, KeyboardEvent } from './events';

export type PlayerCallback = () => void;
export type LoopCallback = (current: number, total: number) => void;
export type EventCallback = (event: MacroEvent) => void;

export class Player {
  private playing: boolean = false;
  private stopRequested: boolean = false;
  private currentLoop: number = 0;
  private totalLoops: number = 1;

  public onStart?: PlayerCallback;
  public onStop?: PlayerCallback;
  public onLoop?: LoopCallback;
  public onEvent?: EventCallback;

  constructor() {
    // Configure nut-js
    mouse.config.autoDelayMs = 0;
    keyboard.config.autoDelayMs = 0;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get currentLoopCount(): number {
    return this.currentLoop;
  }

  async play(events: MacroEvent[], loops: number = 1): Promise<void> {
    if (this.playing || events.length === 0) return;

    this.stopRequested = false;
    this.totalLoops = loops;
    this.currentLoop = 0;
    this.playing = true;

    if (this.onStart) this.onStart();

    try {
      let loopCount = 0;
      while (!this.stopRequested) {
        loopCount++;
        this.currentLoop = loopCount;

        if (this.onLoop) this.onLoop(loopCount, loops);

        await this.playOnce(events);

        // Check loop count (0 = infinite loop)
        if (loops > 0 && loopCount >= loops) break;
      }
    } finally {
      this.playing = false;
      if (this.onStop) this.onStop();
    }
  }

  stop(): void {
    this.stopRequested = true;
  }

  private async playOnce(events: MacroEvent[]): Promise<void> {
    if (events.length === 0) return;

    const startTime = performance.now() / 1000;

    for (const event of events) {
      if (this.stopRequested) break;

      // Timing adjustment: wait until event timestamp
      const targetTime = startTime + event.timestamp;
      const currentTime = performance.now() / 1000;

      if (targetTime > currentTime) {
        await this.sleep((targetTime - currentTime) * 1000);
      }

      if (this.stopRequested) break;

      // Execute event
      await this.executeEvent(event);

      if (this.onEvent) this.onEvent(event);
    }
  }

  private async executeEvent(event: MacroEvent): Promise<void> {
    if (isMouseEvent(event)) {
      await this.executeMouseEvent(event);
    } else if (isKeyboardEvent(event)) {
      await this.executeKeyboardEvent(event);
    }
  }

  private async executeMouseEvent(event: MouseEvent): Promise<void> {
    const point: Point = { x: event.x, y: event.y };

    switch (event.eventType) {
      case EventType.MOUSE_MOVE:
        await mouse.setPosition(point);
        break;

      case EventType.MOUSE_CLICK:
        const button = this.convertButton(event.button);
        await mouse.setPosition(point);
        if (event.pressed) {
          await mouse.pressButton(button);
        } else {
          await mouse.releaseButton(button);
        }
        break;

      case EventType.MOUSE_SCROLL:
        await mouse.setPosition(point);
        if (event.scrollDy) {
          await mouse.scrollDown(event.scrollDy > 0 ? event.scrollDy : 0);
          await mouse.scrollUp(event.scrollDy < 0 ? -event.scrollDy : 0);
        }
        if (event.scrollDx) {
          await mouse.scrollRight(event.scrollDx > 0 ? event.scrollDx : 0);
          await mouse.scrollLeft(event.scrollDx < 0 ? -event.scrollDx : 0);
        }
        break;
    }
  }

  private async executeKeyboardEvent(event: KeyboardEvent): Promise<void> {
    const key = this.getKeyFromCode(event.keyCode);
    if (!key) return;

    if (event.eventType === EventType.KEY_PRESS) {
      await keyboard.pressKey(key);
    } else {
      await keyboard.releaseKey(key);
    }
  }

  private convertButton(button?: MouseButton): Button {
    switch (button) {
      case MouseButton.LEFT: return Button.LEFT;
      case MouseButton.RIGHT: return Button.RIGHT;
      case MouseButton.MIDDLE: return Button.MIDDLE;
      default: return Button.LEFT;
    }
  }

  private getKeyFromCode(keyCode: number): Key | undefined {
    // Map uiohook keycodes to nut-js keys
    const keyMap: { [code: number]: Key } = {
      14: Key.Backspace,
      15: Key.Tab,
      28: Key.Enter,
      42: Key.LeftShift,
      54: Key.RightShift,
      29: Key.LeftControl,
      3613: Key.RightControl,
      56: Key.LeftAlt,
      3640: Key.RightAlt,
      1: Key.Escape,
      57: Key.Space,
      3657: Key.PageUp,
      3665: Key.PageDown,
      3663: Key.End,
      3655: Key.Home,
      57419: Key.Left,
      57416: Key.Up,
      57421: Key.Right,
      57424: Key.Down,
      3666: Key.Insert,
      3667: Key.Delete,
      // Function keys
      59: Key.F1, 60: Key.F2, 61: Key.F3, 62: Key.F4,
      63: Key.F5, 64: Key.F6, 65: Key.F7, 66: Key.F8,
      67: Key.F9, 68: Key.F10, 87: Key.F11, 88: Key.F12,
      // Number keys
      11: Key.Num0, 2: Key.Num1, 3: Key.Num2, 4: Key.Num3, 5: Key.Num4,
      6: Key.Num5, 7: Key.Num6, 8: Key.Num7, 9: Key.Num8, 10: Key.Num9,
      // Alphabet keys
      30: Key.A, 48: Key.B, 46: Key.C, 32: Key.D, 18: Key.E,
      33: Key.F, 34: Key.G, 35: Key.H, 23: Key.I, 36: Key.J,
      37: Key.K, 38: Key.L, 50: Key.M, 49: Key.N, 24: Key.O,
      25: Key.P, 16: Key.Q, 19: Key.R, 31: Key.S, 20: Key.T,
      22: Key.U, 47: Key.V, 17: Key.W, 45: Key.X, 21: Key.Y, 44: Key.Z,
      // Windows/Meta key
      3675: Key.LeftSuper, 3676: Key.RightSuper,
    };

    return keyMap[keyCode];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
