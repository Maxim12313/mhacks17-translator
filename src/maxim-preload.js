const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("maxim", {
  log: () => console.log("hello there"),
});
