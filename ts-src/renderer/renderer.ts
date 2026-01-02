/**
 * Renderer process
 */

// Prevent duplicate execution (can happen when DevTools reloads the page)
if ((window as unknown as { __rendererInitialized?: boolean }).__rendererInitialized) {
  // Already initialized, skip
} else {
(window as unknown as { __rendererInitialized: boolean }).__rendererInitialized = true;

interface API {
  toggleRecord: () => void;
  togglePlay: (loops: number, infinite: boolean) => void;
  stopAll: () => void;
  saveFile: () => void;
  openFile: () => void;
  clearEvents: () => void;
  updateLoopSettings: (loops: number, infinite: boolean) => void;
  getEventCount: () => Promise<number>;
  getVersion: () => Promise<string>;
  onEventCount: (callback: (count: number) => void) => void;
  onRecordStart: (callback: () => void) => void;
  onRecordStop: (callback: (count: number) => void) => void;
  onPlayStart: (callback: () => void) => void;
  onPlayStop: (callback: () => void) => void;
  onPlayLoop: (callback: (current: number, total: number) => void) => void;
  onFileSaved: (callback: (path: string) => void) => void;
  onFileOpened: (callback: (path: string, count: number) => void) => void;
  onEventsCleared: (callback: () => void) => void;
  onLog: (callback: (message: string) => void) => void;
}

const api = (window as unknown as { api: API }).api;

// DOM elements
const statusEl = document.getElementById('status') as HTMLSpanElement;
const eventCountEl = document.getElementById('event-count') as HTMLSpanElement;
const recordBtn = document.getElementById('record-btn') as HTMLButtonElement;
const playBtn = document.getElementById('play-btn') as HTMLButtonElement;
const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;
const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
const openBtn = document.getElementById('open-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const loopCountInput = document.getElementById('loop-count') as HTMLInputElement;
const infiniteLoopCheck = document.getElementById('infinite-loop') as HTMLInputElement;
const filePathEl = document.getElementById('file-path') as HTMLDivElement;
const logArea = document.getElementById('log-area') as HTMLDivElement;

let isRecording = false;
let isPlaying = false;
let eventCount = 0;

// Button handlers
recordBtn.addEventListener('click', () => {
  api.toggleRecord();
});

playBtn.addEventListener('click', () => {
  const loops = parseInt(loopCountInput.value) || 1;
  const infinite = infiniteLoopCheck.checked;
  api.togglePlay(loops, infinite);
});

stopBtn.addEventListener('click', () => {
  api.stopAll();
});

saveBtn.addEventListener('click', () => {
  api.saveFile();
});

openBtn.addEventListener('click', () => {
  api.openFile();
});

clearBtn.addEventListener('click', () => {
  api.clearEvents();
});

// Sync loop settings to main process when changed
function syncLoopSettings(): void {
  const loops = parseInt(loopCountInput.value) || 1;
  const infinite = infiniteLoopCheck.checked;
  api.updateLoopSettings(loops, infinite);
}

loopCountInput.addEventListener('change', syncLoopSettings);
loopCountInput.addEventListener('input', syncLoopSettings);
infiniteLoopCheck.addEventListener('change', syncLoopSettings);

// Event handlers from main process
api.onEventCount((count) => {
  eventCount = count;
  updateEventCount();
});

api.onRecordStart(() => {
  isRecording = true;
  updateUI();
});

api.onRecordStop((count) => {
  isRecording = false;
  eventCount = count;
  updateUI();
  updateEventCount();
});

api.onPlayStart(() => {
  isPlaying = true;
  updateUI();
});

api.onPlayStop(() => {
  isPlaying = false;
  updateUI();
});

api.onPlayLoop((current, total) => {
  if (total === 0) {
    statusEl.textContent = `Playing... (Loop ${current}/Infinite)`;
  } else {
    statusEl.textContent = `Playing... (Loop ${current}/${total})`;
  }
});

api.onFileSaved((path) => {
  filePathEl.textContent = `File: ${path}`;
});

api.onFileOpened((path, count) => {
  filePathEl.textContent = `File: ${path}`;
  eventCount = count;
  updateEventCount();
});

api.onEventsCleared(() => {
  eventCount = 0;
  filePathEl.textContent = 'File: (not saved)';
  updateEventCount();
});

api.onLog((message) => {
  addLog(message);
});

// UI update functions
function updateUI(): void {
  if (isRecording) {
    statusEl.textContent = 'Recording...';
    recordBtn.textContent = 'Stop Recording (F9)';
    recordBtn.classList.remove('btn-primary');
    recordBtn.classList.add('btn-recording');
    playBtn.disabled = true;
  } else if (isPlaying) {
    statusEl.textContent = 'Playing...';
    recordBtn.disabled = true;
    playBtn.disabled = true;
  } else {
    statusEl.textContent = 'Idle';
    recordBtn.textContent = 'Record (F9)';
    recordBtn.classList.remove('btn-recording');
    recordBtn.classList.add('btn-primary');
    recordBtn.disabled = false;
    playBtn.disabled = false;
  }
}

function updateEventCount(): void {
  eventCountEl.textContent = `Events: ${eventCount}`;
}

function addLog(message: string): void {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  logArea.appendChild(entry);
  logArea.scrollTop = logArea.scrollHeight;
}

// Initialize
(async () => {
  eventCount = await api.getEventCount();
  updateEventCount();
  updateUI();
  syncLoopSettings(); // Sync initial loop settings
})();

// Display version (separate to avoid blocking main init)
(async () => {
  try {
    const version = await api.getVersion();
    const versionEl = document.getElementById('version-info');
    if (versionEl) {
      versionEl.textContent = `v${version}`;
    }
  } catch (e) {
    console.error('Failed to get version:', e);
  }
})();

} // End of initialization guard
