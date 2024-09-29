const languageDropdown = document.getElementById('languageDropdown');

// Add an event listener to listen for changes in the dropdown
languageDropdown.addEventListener('change', () => {
    const selectedLanguage = languageDropdown.value;
    console.log(selectedLanguage);
    window.electronAPI.changeLanguage(selectedLanguage);
});