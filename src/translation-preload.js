const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  receiveTranslation: (callback) => ipcRenderer.on('send-translation', (event, value) => callback(value)),
});