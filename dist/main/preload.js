"use strict";
/**
 * Electron preload script
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    // Actions
    toggleRecord: () => electron_1.ipcRenderer.send('toggle-record'),
    togglePlay: (loops, infinite) => electron_1.ipcRenderer.send('toggle-play', loops, infinite),
    stopAll: () => electron_1.ipcRenderer.send('stop-all'),
    saveFile: () => electron_1.ipcRenderer.send('save-file'),
    openFile: () => electron_1.ipcRenderer.send('open-file'),
    clearEvents: () => electron_1.ipcRenderer.send('clear-events'),
    updateLoopSettings: (loops, infinite) => electron_1.ipcRenderer.send('update-loop-settings', loops, infinite),
    getEventCount: () => electron_1.ipcRenderer.invoke('get-event-count'),
    getVersion: () => electron_1.ipcRenderer.invoke('get-version'),
    // Event listeners
    onEventCount: (callback) => {
        electron_1.ipcRenderer.on('event-count', (_, count) => callback(count));
    },
    onRecordStart: (callback) => {
        electron_1.ipcRenderer.on('record-start', () => callback());
    },
    onRecordStop: (callback) => {
        electron_1.ipcRenderer.on('record-stop', (_, count) => callback(count));
    },
    onPlayStart: (callback) => {
        electron_1.ipcRenderer.on('play-start', () => callback());
    },
    onPlayStop: (callback) => {
        electron_1.ipcRenderer.on('play-stop', () => callback());
    },
    onPlayLoop: (callback) => {
        electron_1.ipcRenderer.on('play-loop', (_, current, total) => callback(current, total));
    },
    onFileSaved: (callback) => {
        electron_1.ipcRenderer.on('file-saved', (_, path) => callback(path));
    },
    onFileOpened: (callback) => {
        electron_1.ipcRenderer.on('file-opened', (_, path, count) => callback(path, count));
    },
    onEventsCleared: (callback) => {
        electron_1.ipcRenderer.on('events-cleared', () => callback());
    },
    onLog: (callback) => {
        electron_1.ipcRenderer.on('log', (_, message) => callback(message));
    },
});
//# sourceMappingURL=preload.js.map