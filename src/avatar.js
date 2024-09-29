const avatar = document.getElementById('avatar');

avatar.addEventListener('click', async () => {
    if (window.electronAPI) {
        window.electronAPI.toggleSettings();
    } else {
        console.error("window.electronAPI is undefined");
        console.log(window.electronAPI);
    }
});