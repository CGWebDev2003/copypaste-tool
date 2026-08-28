const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  resizeWindow: (contentHeight) => ipcRenderer.send('resize-window', contentHeight),
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  writeClipboard: (clip) => ipcRenderer.invoke('write-clipboard', clip),
});
