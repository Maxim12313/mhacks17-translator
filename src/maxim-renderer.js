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

  let live = false;
  let recorder;
  let chunks = [];

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function transcribe(blob) {
    try {
      const converted = await blobToBase64(blob);
      console.log("converted to client is " + converted);
      const res = window.maxim.transcribe(converted);
      console.log("result is " + res);
    } catch (error) {
      console.log("Error: " + error);
    }
  }

  recordButton.onclick = async () => {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(media);

    recorder.start();

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = (event) => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audioElement.src = audioURL;
      transcribe(blob);
    };
  };

  stopButton.onclick = async () => {
    recorder.stop();
  };
}
recordHandler();
