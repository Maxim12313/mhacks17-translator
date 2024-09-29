const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  submitInput: (value) => ipcRenderer.send("submit-input", value),
  onInputReceived: (callback) => ipcRenderer.on("input-received", callback),
  closePopup: () => ipcRenderer.send("close-popup"),
  cartesia: (value) => ipcRenderer.invoke('tts-audio', value),
  transcribe: async (input) =>
    await ipcRenderer.invoke("transcribe", { input }),
  sendTranscription: (transcription) => 
    ipcRenderer.send("send-transcription", transcription), // New method
});