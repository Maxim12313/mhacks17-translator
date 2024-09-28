const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPopup: () => ipcRenderer.send('open-popup'),
  closePopup: () => ipcRenderer.send('close-popup'),
  submitInput: (value) => ipcRenderer.send('submit-input', value),
  onInputReceived: (callback) => ipcRenderer.on('input-received', callback)
});