const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  translateTo: async (input, language) =>
    await ipcRenderer.invoke("translate-to", { input, language }),

  receiveTranslation: (callback) =>
    ipcRenderer.on("send-translation", (event, value) => callback(value)),

  cartesia: (value) => ipcRenderer.invoke("tts-audio", value),

  streamTranscribe: async (base64) =>
    await ipcRenderer.invoke("stream-transcribe", { base64 }),

  stopStreaming: () => ipcRenderer.send("stop-streaming"),
});

contextBridge.exposeInMainWorld("transcriber", {
  onStart: (callback) => ipcRenderer.on("start-stream", callback),
  onEnd: (callback) => ipcRenderer.on("end-stream", callback),
});
