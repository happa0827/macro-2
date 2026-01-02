/**
 * Event data structure definitions
 */

export enum EventType {
  // Mouse events
  MOUSE_MOVE = 0x01,
  MOUSE_CLICK = 0x02,
  MOUSE_SCROLL = 0x03,

  // Keyboard events
  KEY_PRESS = 0x10,
  KEY_RELEASE = 0x11,
}

export enum MouseButton {
  LEFT = 0x01,
  RIGHT = 0x02,
  MIDDLE = 0x03,
}

export interface BaseEvent {
  eventType: EventType;
  timestamp: number; // Elapsed time from recording start (seconds)
}

export interface MouseEvent extends BaseEvent {
  eventType: EventType.MOUSE_MOVE | EventType.MOUSE_CLICK | EventType.MOUSE_SCROLL;
  x: number;
  y: number;
  button?: MouseButton;
  pressed?: boolean; // For click events
  scrollDx?: number; // For scroll events
  scrollDy?: number; // For scroll events
}

export interface KeyboardEvent extends BaseEvent {
  eventType: EventType.KEY_PRESS | EventType.KEY_RELEASE;
  keyCode: number; // Virtual key code
  keyChar?: string; // For character keys
}

export type MacroEvent = MouseEvent | KeyboardEvent;

export function isMouseEvent(event: MacroEvent): event is MouseEvent {
  return [EventType.MOUSE_MOVE, EventType.MOUSE_CLICK, EventType.MOUSE_SCROLL].includes(event.eventType);
}

export function isKeyboardEvent(event: MacroEvent): event is KeyboardEvent {
  return [EventType.KEY_PRESS, EventType.KEY_RELEASE].includes(event.eventType);
}
