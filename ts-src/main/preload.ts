/**
 * Electron preload script
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Actions
  toggleRecord: () => ipcRenderer.send('toggle-record'),
  togglePlay: (loops: number, infinite: boolean) => ipcRenderer.send('toggle-play', loops, infinite),
  stopAll: () => ipcRenderer.send('stop-all'),
  saveFile: () => ipcRenderer.send('save-file'),
  openFile: () => ipcRenderer.send('open-file'),
  clearEvents: () => ipcRenderer.send('clear-events'),
  updateLoopSettings: (loops: number, infinite: boolean) => ipcRenderer.send('update-loop-settings', loops, infinite),
  getEventCount: () => ipcRenderer.invoke('get-event-count'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Event listeners
  onEventCount: (callback: (count: number) => void) => {
    ipcRenderer.on('event-count', (_, count) => callback(count));
  },
  onRecordStart: (callback: () => void) => {
    ipcRenderer.on('record-start', () => callback());
  },
  onRecordStop: (callback: (count: number) => void) => {
    ipcRenderer.on('record-stop', (_, count) => callback(count));
  },
  onPlayStart: (callback: () => void) => {
    ipcRenderer.on('play-start', () => callback());
  },
  onPlayStop: (callback: () => void) => {
    ipcRenderer.on('play-stop', () => callback());
  },
  onPlayLoop: (callback: (current: number, total: number) => void) => {
    ipcRenderer.on('play-loop', (_, current, total) => callback(current, total));
  },
  onFileSaved: (callback: (path: string) => void) => {
    ipcRenderer.on('file-saved', (_, path) => callback(path));
  },
  onFileOpened: (callback: (path: string, count: number) => void) => {
    ipcRenderer.on('file-opened', (_, path, count) => callback(path, count));
  },
  onEventsCleared: (callback: () => void) => {
    ipcRenderer.on('events-cleared', () => callback());
  },
  onLog: (callback: (message: string) => void) => {
    ipcRenderer.on('log', (_, message) => callback(message));
  },
});
