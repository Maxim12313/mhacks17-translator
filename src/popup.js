const popupInput = document.getElementById("popupInput");

popupInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const inputValue = popupInput.value.trim();
    if (inputValue) {
      console.log(inputValue);
      window.electronAPI.cartesia(inputValue);
      window.electronAPI.submitInput(inputValue);
      popupInput.value = "";
    }
  }
});

// Focus the input field when the window opens
popupInput.focus();


function recordHandler() {
  const recordButton = document.getElementById("record");
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
    if (!live) {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(media, { mimeType: "audio/webm" });

      // Move the onstop event handler here
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async (event) => { // {{ edit_1 }}
        const blob = new Blob(chunks, { type: "audio/webm" });
        // const audioURL = window.URL.createObjectURL(blob);
        // audioElement.src = audioURL; // This line may cause an error if audioElement is null
        const base64 = await convertBase64(blob);

        // res is the transcription
        const res = await window.electronAPI.transcribe(base64);

        // Send transcription to translation window
        window.electronAPI.sendTranscription(res); 

        chunks = []; // Reset chunks for the next recording
      }; // {{ edit_1 }}

      recorder.start();
      live = true;
      console.log("recording");
      recordButton.style.backgroundColor = "red"; // Turn the button red when recording
    } else {
      recorder.stop();
      live = false;
      console.log("stop");
      recordButton.style.backgroundColor = ""; // Reset the button color when not recording
    }
  };
}

// Call recordHandler after DOM is fully loaded
document.addEventListener("DOMContentLoaded", recordHandler);

