const input = document.getElementById("popupInput");
const output = document.getElementById("translated");

function typingHandler() {
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

function recordHandler() {
  const recordButton = document.getElementById("record");
  const stopButton = document.getElementById("stop");
  const audioElement = document.getElementById("audio");
  const transcribeElement = document.getElementById("transcribe");

  let live = false;
  let recorder;
  let chunks = [];

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

  recordButton.onclick = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(media, { mimeType: "audio/webm" });

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.start();

    recorder.onstop = async (event) => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const audioURL = window.URL.createObjectURL(blob);
      audioElement.src = audioURL;
      const base64 = await convertBase64(blob);

      // res is the transcription
      const res = await window.maxim.transcribe(base64);
      transcribeElement.innerText = res;
    };
  };

  stopButton.onclick = async () => {
    recorder.stop();
  };
}
recordHandler();
