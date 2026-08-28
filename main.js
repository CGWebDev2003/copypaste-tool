const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

const WINDOW_WIDTH = 320;
const WINDOW_HEIGHT = 200;
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
