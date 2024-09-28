const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");

let mainWindow;
let popupWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

function testMaxim() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "maxim-preload.js"),
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, "maxim.html"));
}

function togglePopup() {
  if (popupWindow) {
    popupWindow.close();
    popupWindow = null;
  } else {
    createPopup();
  }
}

function createPopup() {
  popupWindow = new BrowserWindow({
    width: 300,
    height: 200,
    parent: mainWindow,
    modal: false,
    frame: true,
    movable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  popupWindow.loadFile(path.join(__dirname, "popup.html"));

  popupWindow.on("closed", () => {
    popupWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  testMaxim();

  globalShortcut.register("CommandOrControl+I", togglePopup);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.on("submit-input", (event, value) => {
  mainWindow.webContents.send("input-received", value);
  if (popupWindow) popupWindow.close();
});

