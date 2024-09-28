const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("maxim", {
  log: () => console.log("hello there"),
  translateTo: async (input, language) =>
    await ipcRenderer.invoke("translate-to", { input, language }),
});
