const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  clipbord,
} = require("electron");
const path = require("path");
const deepl = require("deepl-node");
const toggleBind = "CommandOrControl+I";
const { create } = require("domain");
const fetchAudio = require("./fetchAudio");

let mainWindow;
let popupWindow;
let avatarWindow;
let settingsWindow;

function createSettingsWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  settingsWindow = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: false,
    frame: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Set the overlay position to bottom-right corner
  settingsWindow.setBounds({
    x: width - 220, 
    y: (height / 2) - 50,
    width: 200,
    height: 200,
  });

  settingsWindow.loadFile("src/settings.html");

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function createAvatarWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  avatarWindow = new BrowserWindow({
    width: 500, // 200
    height: 500, // 200
    transparent: true,
    frame: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // avatarWindow.setIgnoreMouseEvents(true);
  avatarWindow.setMovable(true);

  // Set the overlay position to bottom-right corner
  avatarWindow.setBounds({
    x: width - 700, // Adjusted for the width of the avatar 220
    y: height - 700, // Adjusted for the height of the avatar 220
    width: 500, // 200
    height: 500, // 200
  });

  avatarWindow.loadFile("src/avatar.html");

  avatarWindow.on("closed", () => {
    avatarWindow = null;
  });
}

function togglePopup() {
  if (popupWindow) {
    // Close both windows if the popup is already open
    popupWindow.close();
    avatarWindow.close(); // Close avatar if popup is closed
    popupWindow = null;
    avatarWindow = null;
  } else {
    // Create both windows if they are not open
    createAvatarWindow();
    createPopup();
    createSettingsWindow();

    // Ensure both windows stay on top
    avatarWindow.setAlwaysOnTop(true);
    popupWindow.setAlwaysOnTop(true);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
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

function createPopup() {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;
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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  popupWindow.loadFile(path.join(__dirname, "popup.html"));

  popupWindow.on("closed", () => {
    popupWindow = null;
  });

  popupWindow.on("blur", () => {
    // popupWindow.close();
  });

  // Prevent the window from being moved
  popupWindow.setMovable(false);
}

app.whenReady().then(() => {
  createWindow();
  testMaxim();

  globalShortcut.register("CommandOrControl+I", togglePopup);
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

ipcMain.on('toggle-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
    settingsWindow = null;
  }
  else {
    createSettingsWindow();
  }
});

const authkey = "9e6ec4bd-b318-4768-b361-0784175a62d4:fx";
const translator = new deepl.Translator(authkey);

ipcMain.handle("popup-submitted", async (event, inputValue) => {
  try {
    await fetchAudio(inputValue);
    event.sender.send("audio-generated");
  } catch (error) {
    console.error("Error fetching audio:", error);
    event.sender.send("audio-error", error.message);
  }
});

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

const speech = require("@google-cloud/speech");
const client = new speech.SpeechClient();
ipcMain.handle("transcribe", async (event, { data }) => {
  console.log("data was " + data);
  const request = {
    audio: {
      content: data,
    },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
    },
  };

  try {
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");
    console.log("Transcription:", transcription);
    return transcription;
  } catch (error) {
    console.error("Error:", error);
  }
});
