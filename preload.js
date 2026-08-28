const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  resizeWindow: (contentHeight) => ipcRenderer.send('resize-window', contentHeight),
});
