const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');

async function fetchAudio(text) {
  try {
    const response = await fetch('http://localhost:3000/api/cartesia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: text,
        model_id: "sonic-english",
        voice: { mode: "id", id: "a0e99841-438c-4a64-b679-ae501e7d6091" },
        output_format: { container: "raw", encoding: "pcm_f32le", sample_rate: 44100 },
      }),
    });

    console.log('CARTESIAN RAN');

    const buffer = await response.buffer();
    fs.writeFileSync('sonic.wav', buffer);

    exec('ffmpeg -f f32le -i sonic.wav sonic_output.wav', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ffmpeg: ${error.message}`);
        return;
      }
      console.log(`ffmpeg output: ${stdout}`);
    });
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}

module.exports = fetchAudio;
