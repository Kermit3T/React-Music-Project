const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(express.json());

app.post('/download', async (req, res) => {
  const { inputLink, fileName } = req.body;

  // Use ytdl-core to download the MP3
  try {
    const videoInfo = await ytdl.getInfo(inputLink);
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    ytdl(inputLink, { format: audioFormat })
      .pipe(res);
  } catch (error) {
    console.error('Error downloading MP3:', error);
    res.status(500).send('Error downloading MP3');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});