"use strict";
/**
 * Electron main process
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("electron");
const update_electron_app_1 = require("update-electron-app");
// Setup auto-updater with notification
(0, update_electron_app_1.updateElectronApp)({
    notifyUser: false // We'll handle notification ourselves
});
// Auto-updater events
electron_2.autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['今すぐ再起動', '後で'],
        title: 'アップデート',
        message: releaseName || 'アップデート',
        detail: '新しいバージョンがダウンロードされました。再起動してアップデートを適用します。'
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) {
            electron_2.autoUpdater.quitAndInstall();
        }
    });
});
// Disable hardware acceleration to prevent GPU crashes
electron_1.app.disableHardwareAcceleration();
// Disable GPU cache to prevent "Unable to move the cache" errors on Windows
electron_1.app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
electron_1.app.commandLine.appendSwitch('disk-cache-size', '0');
// Disable Autofill to prevent DevTools protocol errors
electron_1.app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication,Autofill');
const path = __importStar(require("path"));
const recorder_1 = require("./recorder");
const player_1 = require("./player");
const hotkeys_1 = require("./hotkeys");
const storage_1 = require("./storage");
const uiohook_manager_1 = require("./uiohook-manager");
let mainWindow = null;
let recorder;
let player;
let hotkeyListener;
let events = [];
// Loop settings (synced from renderer)
let loopCount = 1;
let infiniteLoop = false;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
function setupComponents() {
    recorder = new recorder_1.Recorder();
    player = new player_1.Player();
    hotkeyListener = new hotkeys_1.HotkeyListener();
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
    player.onLoop = (current, total) => {
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
function toggleRecord() {
    if (recorder.isRecording) {
        events = recorder.stop();
        mainWindow?.webContents.send('record-stop', events.length);
        mainWindow?.webContents.send('log', 'Recording stopped');
    }
    else {
        if (player.isPlaying)
            return;
        recorder.start();
        mainWindow?.webContents.send('record-start');
        mainWindow?.webContents.send('log', 'Recording started');
    }
}
function togglePlay(loops, infinite) {
    if (player.isPlaying || recorder.isRecording)
        return;
    if (events.length === 0) {
        mainWindow?.webContents.send('log', 'No macro to play');
        return;
    }
    const loopCount = infinite ? 0 : loops;
    player.play(events, loopCount);
    mainWindow?.webContents.send('log', 'Playback started');
}
function stopAll() {
    if (recorder.isRecording) {
        events = recorder.stop();
        mainWindow?.webContents.send('record-stop', events.length);
    }
    if (player.isPlaying) {
        player.stop();
    }
    mainWindow?.webContents.send('log', 'Stopped');
}
async function saveFile() {
    if (events.length === 0) {
        mainWindow?.webContents.send('log', 'No macro to save');
        return;
    }
    const result = await electron_1.dialog.showSaveDialog(mainWindow, {
        defaultPath: 'macro.clkm',
        filters: [
            { name: 'Click Macro', extensions: ['clkm'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    if (!result.canceled && result.filePath) {
        try {
            storage_1.MacroFile.save(result.filePath, events);
            mainWindow?.webContents.send('file-saved', result.filePath);
            mainWindow?.webContents.send('log', `Saved: ${result.filePath}`);
        }
        catch (err) {
            mainWindow?.webContents.send('log', `Save failed: ${err}`);
        }
    }
}
async function openFile() {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, {
        filters: [
            { name: 'Click Macro', extensions: ['clkm'] },
            { name: 'All Files', extensions: ['*'] },
        ],
    });
    if (!result.canceled && result.filePaths.length > 0) {
        try {
            events = storage_1.MacroFile.load(result.filePaths[0]);
            mainWindow?.webContents.send('file-opened', result.filePaths[0], events.length);
            mainWindow?.webContents.send('log', `Loaded: ${result.filePaths[0]}`);
        }
        catch (err) {
            mainWindow?.webContents.send('log', `Load failed: ${err}`);
        }
    }
}
function clearEvents() {
    events = [];
    mainWindow?.webContents.send('events-cleared');
    mainWindow?.webContents.send('log', 'Macro cleared');
}
// IPC handlers
function setupIPC() {
    electron_1.ipcMain.on('toggle-record', () => toggleRecord());
    electron_1.ipcMain.on('toggle-play', (_, loops, infinite) => togglePlay(loops, infinite));
    electron_1.ipcMain.on('stop-all', () => stopAll());
    electron_1.ipcMain.on('save-file', () => saveFile());
    electron_1.ipcMain.on('open-file', () => openFile());
    electron_1.ipcMain.on('clear-events', () => clearEvents());
    electron_1.ipcMain.on('update-loop-settings', (_, loops, infinite) => {
        loopCount = loops;
        infiniteLoop = infinite;
    });
    electron_1.ipcMain.handle('get-event-count', () => events.length);
    electron_1.ipcMain.handle('get-version', () => electron_1.app.getVersion());
}
electron_1.app.whenReady().then(() => {
    setupComponents();
    setupIPC();
    createWindow();
    // Start uiohook globally and enable hotkey listener
    uiohook_manager_1.uiohookManager.start();
    hotkeyListener.start();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    hotkeyListener.stop();
    uiohook_manager_1.uiohookManager.stop();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map