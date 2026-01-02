/**
 * Electron main process
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';

// Disable hardware acceleration to prevent GPU crashes
app.disableHardwareAcceleration();

// Disable GPU cache to prevent "Unable to move the cache" errors on Windows
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-size', '0');

// Disable Autofill to prevent DevTools protocol errors
app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,Autofill');
import * as path from 'path';
import { Recorder } from './recorder';
import { Player } from './player';
import { HotkeyListener } from './hotkeys';
import { MacroFile } from './storage';
import { MacroEvent } from './events';
import { uiohookManager } from './uiohook-manager';

let mainWindow: BrowserWindow | null = null;
let recorder: Recorder;
let player: Player;
let hotkeyListener: HotkeyListener;
let events: MacroEvent[] = [];

// Loop settings (synced from renderer)
let loopCount = 1;
let infiniteLoop = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 450,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));



  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupComponents(): void {
  recorder = new Recorder();
  player = new Player();
  hotkeyListener = new HotkeyListener();

  // Initialize listeners before starting uiohook
  recorder.init();
  hotkeyListener.init();

  // Recorder callbacks
  recorder.onEvent = () => {
    mainWindow?.webContents.send('event-count', recorder.getEvents().length);
  };

  // Player callbacks
  player.onStart = () => {
    mainWindow?.webContents.send('play-start');
  };

  player.onStop = () => {
    mainWindow?.webContents.send('play-stop');
  };

  player.onLoop = (current: number, total: number) => {
    mainWindow?.webContents.send('play-loop', current, total);
  };

  // Hotkey callbacks
  hotkeyListener.onRecord = () => {
    toggleRecord();
  };

  hotkeyListener.onPlay = () => {
    togglePlay(loopCount, infiniteLoop);
  };

  hotkeyListener.onStop = () => {
    stopAll();
  };
}

function toggleRecord(): void {
  if (recorder.isRecording) {
    events = recorder.stop();
    mainWindow?.webContents.send('record-stop', events.length);
    mainWindow?.webContents.send('log', 'Recording stopped');
  } else {
    if (player.isPlaying) return;
    recorder.start();
    mainWindow?.webContents.send('record-start');
    mainWindow?.webContents.send('log', 'Recording started');
  }
}

function togglePlay(loops: number, infinite: boolean): void {
  if (player.isPlaying || recorder.isRecording) return;
  if (events.length === 0) {
    mainWindow?.webContents.send('log', 'No macro to play');
    return;
  }

  const loopCount = infinite ? 0 : loops;
  player.play(events, loopCount);
  mainWindow?.webContents.send('log', 'Playback started');
}

function stopAll(): void {
  if (recorder.isRecording) {
    events = recorder.stop();
    mainWindow?.webContents.send('record-stop', events.length);
  }

  if (player.isPlaying) {
    player.stop();
  }

  mainWindow?.webContents.send('log', 'Stopped');
}

async function saveFile(): Promise<void> {
  if (events.length === 0) {
    mainWindow?.webContents.send('log', 'No macro to save');
    return;
  }

  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: 'macro.clkm',
    filters: [
      { name: 'Click Macro', extensions: ['clkm'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePath) {
    try {
      MacroFile.save(result.filePath, events);
      mainWindow?.webContents.send('file-saved', result.filePath);
      mainWindow?.webContents.send('log', `Saved: ${result.filePath}`);
    } catch (err) {
      mainWindow?.webContents.send('log', `Save failed: ${err}`);
    }
  }
}

async function openFile(): Promise<void> {
  const result = await dialog.showOpenDialog(mainWindow!, {
    filters: [
      { name: 'Click Macro', extensions: ['clkm'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      events = MacroFile.load(result.filePaths[0]);
      mainWindow?.webContents.send('file-opened', result.filePaths[0], events.length);
      mainWindow?.webContents.send('log', `Loaded: ${result.filePaths[0]}`);
    } catch (err) {
      mainWindow?.webContents.send('log', `Load failed: ${err}`);
    }
  }
}

function clearEvents(): void {
  events = [];
  mainWindow?.webContents.send('events-cleared');
  mainWindow?.webContents.send('log', 'Macro cleared');
}

// IPC handlers
function setupIPC(): void {
  ipcMain.on('toggle-record', () => toggleRecord());
  ipcMain.on('toggle-play', (_, loops: number, infinite: boolean) => togglePlay(loops, infinite));
  ipcMain.on('stop-all', () => stopAll());
  ipcMain.on('save-file', () => saveFile());
  ipcMain.on('open-file', () => openFile());
  ipcMain.on('clear-events', () => clearEvents());
  ipcMain.on('update-loop-settings', (_, loops: number, infinite: boolean) => {
    loopCount = loops;
    infiniteLoop = infinite;
  });
  ipcMain.handle('get-event-count', () => events.length);
}

app.whenReady().then(() => {
  setupComponents();
  setupIPC();
  createWindow();

  // Start uiohook globally and enable hotkey listener
  uiohookManager.start();
  hotkeyListener.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  hotkeyListener.stop();
  uiohookManager.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
