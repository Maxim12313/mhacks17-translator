const popupInput = document.getElementById('popupInput');
const fetchAudio = require('./fetchAudio');
const path = require('path');

popupInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const inputValue = popupInput.value.trim();
        if (inputValue) {
            fetchAudio(inputValue);
            window.electronAPI.submitInput(inputValue);
            popupInput.value = '';
        }
    } else if (event.key === 'Escape') {
        window.electronAPI.closePopup();
    }
});

// Focus the input field when the window opens
popupInput.focus();