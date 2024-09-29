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
const { getWaveBlob } = require("webm-to-wav-converter");

let mainWindow;
let popupWindow;
let avatarWindow;
let translationWindow;

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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  avatarWindow.setIgnoreMouseEvents(true);
  avatarWindow.setMovable(true);

  // Set the overlay position to bottom-right corner
  avatarWindow.setBounds({
    x: width - 220, // Adjusted for the width of the avatar
    y: height - 220, // Adjusted for the height of the avatar
    width: 200,
    height: 200,
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
    
    if (translationWindow){
      translationWindow.close();
    }
    translationWindow = null;
    popupWindow = null;
    avatarWindow = null;
  } else {
    // Create both windows if they are not open
    createAvatarWindow();
    createPopup();

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
    movable: true,
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

ipcMain.on("submit-input", async (event, value) => {
  const translatedValue = await translator.translateText(value, null, "fr"); // Translate to French
  mainWindow.webContents.send("input-received", translatedValue);
  if (translationWindow){
    translationWindow.close();  
  }
  createTranslationWindow(translatedValue.text); // Create a new window to show the translation
  // Focus on the popup window after submitting input and showing the translation window
  if (popupWindow) {
    popupWindow.focus();
  }
});

function createTranslationWindow(translatedText) {
  translationWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    x: 1000,
    y: 500,
    transparent: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, "translation-preload.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Send the translated text to the translation window
  translationWindow.webContents.on("did-finish-load", async () => {
    translationWindow.webContents.send("send-translation", translatedText);
  
  try {
    await fetchAudio(translatedText);
  } catch (error) {
    console.error("Error fetching audio:", error);
  }
  });

  translationWindow.loadFile(path.join(__dirname, "translation.html"));
}

ipcMain.on("send-transcription", (event, transcription) => {
  // Ensure transcription has the correct structure

  createTranslationWindow(transcription);
});

ipcMain.on("close-popup", () => {
  if (popupWindow) popupWindow.close();
  if (avatarWindow) avatarWindow.close();
});

const authkey = "9e6ec4bd-b318-4768-b361-0784175a62d4:fx";
const translator = new deepl.Translator(authkey);

// ipcMain.handle("tts-audio", async (event, inputValue) => {
//   try {
//     await fetchAudio(inputValue);
//     event.sender.send("audio-generated");
//   } catch (error) {
//     console.error("Error fetching audio:", error);
//     event.sender.send("audio-error", error.message);
//   }
// });

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
const { log } = require("console");
const client = new speech.SpeechClient();
ipcMain.handle("transcribe", async (event, { input }) => {
  const audio = {
    content: input,
  };

  const config = {
    encoding: "WEBM_OPUS",
    languageCode: "en-US",
  };

  const request = {
    audio,
    config,
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
    return error;
  }
});
