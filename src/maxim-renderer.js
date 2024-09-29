function typingHandler() {
  const input = document.getElementById("popupInput");
  const output = document.getElementById("translated");
  let timeId = -1;
  let prev = 0;
  function throttleDebounce(func, limit) {
    const curr = new Date().getTime();
    const diff = curr - prev;
    if (diff > limit) {
      prev = curr;
      func();
      clearTimeout(timeId);
      timeId = -1;
    } else {
      timeId = setTimeout(() => {
        prev = new Date().getTime();
        func();
        clearTimeout(timeId);
        timeId = -1;
      }, limit);
    }
  }

  async function doTranslation() {
    const curr = input.value;
    const language = "fr";

    if (curr == "") {
      output.innerText = "";
      return;
    }
    const res = await window.maxim.translateTo(input.value, language);
    if (!res.error) {
      output.innerText = res.text;
    } else {
      console.log(res.error);
    }
  }

  input.addEventListener("input", async (event) => {
    throttleDebounce(doTranslation, 500);
  });
}
typingHandler();

async function convertBase64(blob) {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function recordHandler() {
  const recordButton = document.getElementById("record");
  const stopButton = document.getElementById("stop");
  const audioElement = document.getElementById("audio");
  const transcribeElement = document.getElementById("transcribe");

  let live = false;
  let recorder;
  let chunks = [];

  recordButton.onclick = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(media, { mimeType: "audio/webm" });

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();

    recorder.onstop = async (event) => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audioElement.src = audioURL;
      const base64 = await convertBase64(blob);

      // res is the transcription
      const res = await window.maxim.transcribe(base64);
      console.log(res);
      if (res == undefined) res = "";
      transcribeElement.innerText = res;
    };
  };

  stopButton.onclick = () => {
    recorder.stop();
  };
}
recordHandler();

function recordComputerHandler() {
  const recordButton = document.getElementById("record-computer");
  const stopButton = document.getElementById("computer-stop");
  const audioElement = document.getElementById("audio");

  let text = "";
  let recorder;

  recordButton.onclick = async () => {
    const ops = await navigator.mediaDevices.enumerateDevices();
    console.log(ops);
    const want = "BlackHole 2ch (Virtual)";
    let deviceId;
    ops.forEach((device) => {
      if (device.kind == "audioinput" && device.label == want) {
        deviceId = device.deviceId;
      }
    });
    if (!deviceId) {
      console.log("missing blackhole");
      return;
    }
    console.log("so id is " + deviceId);

    const media = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId,
      },
    });

    recorder = new MediaRecorder(media, { mimeType: "audio/webm" });

    recorder.ondataavailable = async (event) => {
      if (event.data.size == 0) return;
      const base64 = await convertBase64(event.data);
      text = await window.maxim.streamTranscribe(base64);
      console.log(text);
    };

    recorder.start(250);
  };

  stopButton.onclick = () => {
    recorder.stop();
    window.maxim.stopStreaming();
  };
}
recordComputerHandler();
