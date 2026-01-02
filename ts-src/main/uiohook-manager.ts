/**
 * Centralized uIOhook manager to prevent conflicts
 */

import { uIOhook, UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi';

class UIOhookManager {
  private started: boolean = false;
  private keydownCallbacks: ((e: UiohookKeyboardEvent) => void)[] = [];
  private keyupCallbacks: ((e: UiohookKeyboardEvent) => void)[] = [];
  private mousemoveCallbacks: ((e: UiohookMouseEvent) => void)[] = [];
  private mousedownCallbacks: ((e: UiohookMouseEvent) => void)[] = [];
  private mouseupCallbacks: ((e: UiohookMouseEvent) => void)[] = [];
  private wheelCallbacks: ((e: UiohookWheelEvent) => void)[] = [];

  start(): void {
    if (this.started) return;

    uIOhook.on('keydown', (e) => {
      this.keydownCallbacks.forEach(cb => cb(e));
    });

    uIOhook.on('keyup', (e) => {
      this.keyupCallbacks.forEach(cb => cb(e));
    });

    uIOhook.on('mousemove', (e) => {
      this.mousemoveCallbacks.forEach(cb => cb(e));
    });

    uIOhook.on('mousedown', (e) => {
      this.mousedownCallbacks.forEach(cb => cb(e));
    });

    uIOhook.on('mouseup', (e) => {
      this.mouseupCallbacks.forEach(cb => cb(e));
    });

    uIOhook.on('wheel', (e) => {
      this.wheelCallbacks.forEach(cb => cb(e));
    });

    uIOhook.start();
    this.started = true;
  }

  stop(): void {
    if (!this.started) return;
    uIOhook.stop();
    this.started = false;
  }

  onKeyDown(callback: (e: UiohookKeyboardEvent) => void): void {
    this.keydownCallbacks.push(callback);
  }

  onKeyUp(callback: (e: UiohookKeyboardEvent) => void): void {
    this.keyupCallbacks.push(callback);
  }

  onMouseMove(callback: (e: UiohookMouseEvent) => void): void {
    this.mousemoveCallbacks.push(callback);
  }

  onMouseDown(callback: (e: UiohookMouseEvent) => void): void {
    this.mousedownCallbacks.push(callback);
  }

  onMouseUp(callback: (e: UiohookMouseEvent) => void): void {
    this.mouseupCallbacks.push(callback);
  }

  onWheel(callback: (e: UiohookWheelEvent) => void): void {
    this.wheelCallbacks.push(callback);
  }
}

export const uiohookManager = new UIOhookManager();
