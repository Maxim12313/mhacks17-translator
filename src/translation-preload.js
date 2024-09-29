const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  translateTo: async (input, language) =>
    await ipcRenderer.invoke("translate-to", { input, language }),
  receiveTranslation: (callback) => ipcRenderer.on('send-translation', (event, value) => callback(value)),
  cartesia: (value) => ipcRenderer.invoke('tts-audio', value),
});