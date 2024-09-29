const { ipcRenderer } = require('electron');
const popupInput = document.getElementById('popupInput');
const fetchAudio = require('./fetchAudio');

popupInput.addEventListener('keydown', (event) => {
    console.log('CARTESIAN INITIATE');
    
    if (event.key === 'Enter') {
        const inputValue = popupInput.value.trim();
        if (inputValue) {
            ipcRenderer.send('popup-enter-pressed', inputValue);
            popupInput.value = '';
        }
    }
});

ipcRenderer.on('audio-generated', () => {
    console.log('Audio generated successfully!');
  });
  
  ipcRenderer.on('audio-error', (event, errorMessage) => {
    console.error('Error generating audio:', errorMessage);
  });

// Focus the input field when the window opens
popupInput.focus();