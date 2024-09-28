const openPopupButton = document.getElementById('openPopupButton');
const receivedInput = document.getElementById('receivedInput');

openPopupButton.addEventListener('click', () => {
    window.electronAPI.openPopup();
});

window.electronAPI.onInputReceived((event, value) => {
    receivedInput.textContent = `Received input: ${value}`;
});