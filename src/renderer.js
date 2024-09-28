const receivedInput = document.getElementById("receivedInput");

window.electronAPI.onInputReceived((event, value) => {
  receivedInput.textContent = `Received input: ${value}`;
});

