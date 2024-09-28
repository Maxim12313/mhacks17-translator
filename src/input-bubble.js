document.getElementById('input-field').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      window.electronAPI.submitInput(event.target.value);
    }
  });