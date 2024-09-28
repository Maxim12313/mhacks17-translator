const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let popupWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
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
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  popupWindow.loadFile(path.join(__dirname, 'popup.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-popup', () => {
  createPopup();
});

ipcMain.on('close-popup', () => {
  if (popupWindow) popupWindow.close();
});

ipcMain.on('submit-input', (event, value) => {
  mainWindow.webContents.send('input-received', value);
  if (popupWindow) popupWindow.close();
});