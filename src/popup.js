const submitButton = document.getElementById('submitButton');
const closeButton = document.getElementById('closeButton');
const popupInput = document.getElementById('popupInput');

submitButton.addEventListener('click', () => {
    const inputValue = popupInput.value;
    window.electronAPI.submitInput(inputValue);
});

closeButton.addEventListener('click', () => {
    window.electronAPI.closePopup();
});