const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const player = require('play-sound')();

async function fetchAudio(transcript) {
  const response = await fetch('https://api.cartesia.ai/tts/bytes', {
    method: 'POST',
    headers: {
      'Cartesia-Version': '2024-06-10',
      'X-API-Key': 'cb6e5cbc-95cf-462c-ba19-8a730959284e',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transcript: transcript,
      model_id: 'sonic-english',
      voice: {
        mode: 'id',
        id: 'a0e99841-438c-4a64-b679-ae501e7d6091'
      },
      output_format: {
        container: 'raw',
        encoding: 'pcm_f32le',
        sample_rate: 44100
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const audioStream = response.body;

  // Save the audio stream to a file using ffmpeg
  ffmpeg(audioStream)
    .inputFormat('f32le')
    .audioFrequency(44100)
    .save('sonic.wav')
    .on('end', () => {
      console.log('Audio file saved as sonic.wav');
      player.play('sonic.wav', (err) => {
        if (err) console.error('Error playing audio file:', err);
      });
    })
    .on('error', (err) => {
      console.error('Error saving audio file:', err);
    });
}

module.exports = fetchAudio;
