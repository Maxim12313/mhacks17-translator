const avatar = document.getElementById('avatar');

avatar.addEventListener('click', async () => {
    window.electronAPI.toggleSettings();
});