const { ipcRenderer } = require('electron');

const inputText = document.getElementById('inputText');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const outputText = document.getElementById('outputText');

translateBtn.addEventListener('click', async () => {
    const text = inputText.value;
    const lang = targetLang.value;

    if (text) {
        try {
            const translatedText = await ipcRenderer.invoke('translate-text', { text, targetLang: lang });
            outputText.textContent = translatedText;
        } catch (error) {
            outputText.textContent = 'Error: Unable to translate text';
        }
    }
});
