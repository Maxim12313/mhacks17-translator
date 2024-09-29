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

async function recordComputerHandler() {
  const textElement = document.getElementById("transcription");

  let recorder;

  window.transcriber.onStart(async () => {
    if (recorder) {
      recorder.resume();
      return;
    }
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
      textElement.innerText = await window.electron.streamTranscribe(base64);
    };

    recorder.start(250);
  });

  window.transcriber.onEnd(() => {
    recorder.pause();
    // window.electron.stopStreaming();
  });
}
recordComputerHandler();
