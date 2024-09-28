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

  let live = false;
  let recorder;
  const chunks = [];

  recordButton.onclick = async () => {
    if (recorder) {
      if (live) {
        recordButton.style.background = "white";
        recorder.resume();
      } else {
        recordButton.style.background = "yellow";
        recorder.pause;
      }
    }

    console.log("set");
    const res = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    recorder = new MediaRecorder(res);
    recorder.ondataavailable = () => {
      chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      console.log("blob is " + blob);
      // For now, log the recorded audio size
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
      console.log("playing");
    };
    stopButton.style.visibility = "visible";
    recordButton.style.background = "yellow";
    live = !live;
  };

  stopButton.onclick = () => {
    recorder.stop();
    stopButton.style.visibility = "hidden";
    recordButton.style.background = "white";
    live = false;
  };
}
recordHandler();
