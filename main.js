const { app, BrowserWindow, screen, ipcMain, Menu } = require('electron');
const path = require('path');

Menu.setApplicationMenu(null);

if (!app.isPackaged) {
  try {
    require('electron-reloader')(module);
  } catch (err) {
    console.error('electron-reloader failed to start:', err);
  }
}

const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 120;
const MIN_HEIGHT = 80;
const MARGIN = 16;

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x: workX, y: workY, width: workWidth, height: workHeight } = primaryDisplay.workArea;

  const windowX = workX + workWidth - WINDOW_WIDTH - MARGIN;
  const windowY = workY + workHeight - WINDOW_HEIGHT - MARGIN;

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: windowX,
    y: windowY,
    alwaysOnTop: true,
    resizable: false,
    frame: true,
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.loadFile('index.html');
}

ipcMain.on('resize-window', (event, contentHeight) => {
  if (!mainWindow) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { y: workY, height: workHeight } = primaryDisplay.workArea;
  const maxHeight = workHeight - 2 * MARGIN;

  const [currentWidth] = mainWindow.getContentSize();
  const [, currentOuterHeight] = mainWindow.getSize();
  const [, currentContentHeight] = mainWindow.getContentSize();
  const chrome = currentOuterHeight - currentContentHeight;

  const targetContentHeight = Math.max(MIN_HEIGHT, Math.min(Math.round(contentHeight), maxHeight));
  const targetOuterHeight = targetContentHeight + chrome;

  const bounds = mainWindow.getBounds();
  const bottom = bounds.y + bounds.height;
  let newY = bottom - targetOuterHeight;
  if (newY < workY + MARGIN) newY = workY + MARGIN;

  mainWindow.setBounds({
    x: bounds.x,
    y: newY,
    width: bounds.width,
    height: targetOuterHeight,
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
