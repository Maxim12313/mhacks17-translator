const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const translate = require('@vitalets/google-translate-api');

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('translate-text', async (event, { text, targetLang }) => {
  try {
    const result = await translate(text, { to: targetLang });
    clipboard.writeText(result.text);
    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    return 'Error: Unable to translate text';
  }
});
