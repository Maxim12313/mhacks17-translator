const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require("path");
const deepl = require("deepl-node");
const { clipboard } = require("electron");
const toggleBind = "CommandOrControl+I";
const { create } = require("domain");

let mainWindow;
let popupWindow;
let avatarWindow;

function createAvatarWindow() {

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  avatarWindow = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: true,
    frame: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  avatarWindow.setIgnoreMouseEvents(true);
  avatarWindow.setMovable(true);

  // Set the overlay position to bottom-right corner
  avatarWindow.setBounds({
    x: width - 400, // Right edge position (400 is the width of the overlay)
    y: height - 300, // Bottom edge position (300 is the height of the overlay)
    width: 200,
    height: 200,
  });

  avatarWindow.loadFile('src/avatar.html');

  avatarWindow.on('closed', () => {
    avatarWindow = null;
  });
}

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
  if (popupWindow && avatarWindow) {
    avatarWindow.close();
    popupWindow.close();
    avatarWindow = null;
    popupWindow = null;
  } else {
    createAvatarWindow();
    createPopup();
  }
}

function createPopup() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const popupWidth = 600;
  const popupHeight = 60;

  popupWindow = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x: (screenWidth - popupWidth) / 2,
    y: screenHeight - popupHeight - 20, // 20px padding from the bottom
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  popupWindow.loadFile(path.join(__dirname, 'popup.html'));

  popupWindow.on('closed', () => {
    popupWindow = null;
  });

  popupWindow.on('blur', () => {
    popupWindow.close();
  });

  // Prevent the window from being moved
  popupWindow.setMovable(false);
}

app.whenReady().then(() => {
  createWindow();
  testMaxim();

  globalShortcut.register(toggleBind, togglePopup);

  // app.on("activate", () => {
  //   if (BrowserWindow.getAllWindows().length === 0) {
  //     createWindow();
  //   }
  // });
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

ipcMain.on("close-popup", () => {
  if (popupWindow) popupWindow.close();
  if (avatarWindow) avatarWindow.close();
});

const authkey = "9e6ec4bd-b318-4768-b361-0784175a62d4:fx";
const translator = new deepl.Translator(authkey);

ipcMain.handle("translate-to", async (event, { input, language }) => {
  const usage = await translator.getUsage();
  if (usage.anyLimitReached()) {
    return {
      error: "translation limit",
    };
  }
  try {
    const res = await translator.translateText(input, null, language);
    return res;
  } catch (error) {
    return error;
  }
});
