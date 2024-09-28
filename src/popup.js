const submitButton = document.getElementById('submitButton');
const popupInput = document.getElementById('popupInput');

submitButton.addEventListener('click', () => {
    const inputValue = popupInput.value;
    window.electronAPI.submitInput(inputValue);
});