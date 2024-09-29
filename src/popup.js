const popupInput = document.getElementById('popupInput');

popupInput.addEventListener('keydown', (event) => {
    console.log('CARTESIAN INITIATE');
    
    if (event.key === 'Enter') {
        const inputValue = popupInput.value.trim();
        if (inputValue) {
            console.log(inputValue);
            window.electronAPI.cartesia(inputValue);
            window.electronAPI.submitInput(inputValue);
            popupInput.value = '';
        }
    }
});


// Focus the input field when the window opens
popupInput.focus();