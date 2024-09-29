const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  submitInput: (value) => ipcRenderer.send("submit-input", value),
  onInputReceived: (callback) => ipcRenderer.on("input-received", callback),
  closePopup: () => ipcRenderer.send("close-popup"),
  cartesia: (value) => ipcRenderer.invoke('popup-submitted', value),
  toggleSettings: () => {
    console.log('2');
    ipcRenderer.send('toggle-settings');
  }
});