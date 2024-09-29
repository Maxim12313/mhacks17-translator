const { contextBridge, ipcRenderer, Menu } = require("electron");

contextBridge.exposeInMainWorld("maxim", {
  translateTo: async (input, language) =>
    await ipcRenderer.invoke("translate-to", { input, language }),

  transcribe: async (input) =>
    await ipcRenderer.invoke("transcribe", { input }),

  streamTranscribe: async (base64) =>
    await ipcRenderer.invoke("stream-transcribe", { base64 }),

  stopStreaming: () => ipcRenderer.send("stop-streaming"),
});
