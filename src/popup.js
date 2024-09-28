const popupInput = document.getElementById('popupInput');

popupInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const inputValue = popupInput.value.trim();
        if (inputValue) {
            window.electronAPI.submitInput(inputValue);
            popupInput.value = '';
        }
    } else if (event.key === 'Escape') {
        window.electronAPI.closePopup();
    }
});

// Focus the input field when the window opens
popupInput.focus();