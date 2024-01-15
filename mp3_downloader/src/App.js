import './App.css';
import 'dotenv/config'

function App() {
  function getYouTubeMetadata(link, isPlaylist) {
    // Extract video ID or playlist ID from the link
    var idMatch = link.match(/[?&]v=([^&]+)/);
    var playlistMatch = link.match(/[?&]list=([^&]+)/);
    var apiKey = process.env.YOUTUBE_KEY;
    console.log(playlistMatch);

    if (idMatch || playlistMatch) {
        if (idMatch) {
            var videoId = idMatch[1];
            var apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
        }
        if (isPlaylist && playlistMatch) {
            var playlistId = playlistMatch[1];
            apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&key=${apiKey}`;
        }

        // Fetch data from the API
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (isPlaylist) {
                    var channelName = data.items[0].snippet.channelTitle;
                    var title = data.items[0].snippet.title;
                    console.log("this is data", data);
                    apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&key=${apiKey}`;
                    (async () => {
                        const playlistItems = await getPlaylistItems(playlistId, apiKey);
                        
                        if (playlistItems) {
                            // Store playlist items in a variable
                            var playlistData = playlistItems;
                        } else {
                            alert("playlist is not visable")
                            console.log('Failed to fetch playlist items.');
                        }
                        showMetadata(thumbnailUrl, title, channelName, isPlaylist, playlistData);
                    })();
                } else {
                    // Handle video data
                    var thumbnailUrl = data.items[0].snippet.thumbnails.high.url;
                    var title = data.items[0].snippet.title;
                    var channelName = data.items[0].snippet.channelTitle;

                    showMetadata(thumbnailUrl, title, channelName, isPlaylist, data.items);
                }
            })
            .catch(error => console.error("Error fetching YouTube metadata:", error));
    }
}

async function getPlaylistItems(playlistId, apiKey) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.items) {
            return data.items.map(item => item.snippet);
        } else {
            console.error('Error fetching playlist items:', data.error.message);
            return null;
        }
    } catch (error) {
        console.error('Error fetching playlist items:', error.message);
        return null; 
    }
}

// Function to display YouTube metadata in metadataDisplay div
function showMetadata(thumbnailUrl, title, channelName, isPlaylist, playlistItems) {
    var metadataDisplay = document.querySelector(".metadataDisplay");
    var fileName = document.querySelector("#fileName")

    if (isPlaylist) {
        var playlistHTML = "<ol>";
        playlistItems.forEach(item => {
            if (item.title !== "Deleted video" && item.description !== "This video is unavailable.") {
                playlistHTML += `<li><input type="checkbox" checked>[${item.videoOwnerChannelTitle}] ${item.title}.mp3</input></li>`;
            }
        });
        playlistHTML += "</ol>";
        metadataDisplay.innerHTML = playlistHTML;
        var namePreview = `[${channelName}] ${title}`
        fileName.value = namePreview += ".zip";
    } else {
        var videoHTML = `
        <img src="${thumbnailUrl}" alt="Thumbnail">
        <p>${channelName} - ${title}</p>
        `;
        var namePreview = `[${channelName}] ${title}`
        metadataDisplay.innerHTML = videoHTML;
        fileName.value = namePreview += ".mp3";
    } 
}
  return (
    <div className="App">
      <div className="about">
        <h1>Quick Youtube Music Download</h1>
        <p id="description"> QYMD is a service that let users download an mp3 file from a youtube video or playlist.</p>
        <ol className ="instructions">
            <li> Copy the URL of a youtube video you want to convert to an mp3 file and put it in the input field below</li>
            <li> Click Submit and check "Your submited video" to see if the video is correct </li>
            <li> Edit the file name of your new Mp3</li>
            <li> Click "Download"</li>
        </ol>
      </div>

      <div className="linkFormat">
        <h2>Link Format</h2>
        <p> Choose with type your link is: </p>
        <input type="checkbox" id="isPlaylist" name="Playlist" />This is a playlist
      </div>

      <div className="platformSelection">
        <h2>Platform Selection</h2>
        <select id="platformSelector">
            <option value="youtube">YouTube</option>
            <option value="youtubemusic">YouTube Music</option>
            <option value="soundcloud">SoundCloud</option>
        </select>
      </div>

      <div className="Inputfield">
        <h2>Input Field</h2>
        <p> Paste your link below: </p>
        <input id="inputLinks" type="text" placeholder="https://www.youtube.com/watch?v=..."/>
        <button id="submitButton" onClick={()=>getYouTubeMetadata("https://www.youtube.com/playlist?list=PLDxn5-pMdljFSgLhdcmmmcsm9jXayz7Pf",true)}>Submit</button>
      </div>

      <div className="response">
        <h2> Your submited video </h2>
        <h3>Input Debug:</h3>
        <p id="isLink"></p>
        <h3>Link Submitted:</h3>
        <p id="linkDebug"></p>
      </div>

      <div className="downloadPreview">
        <h2> downloadPreview </h2>

        <div className="metadataDisplay">
            <p>here is the download</p>
        </div>

        <div className="filePreview">
            <input id="fileName" type="text" placeholder="Preview unavailable"/>
        </div>

        <button id="confirmDownload">Download</button>

      </div>

    </div>
  );
}

export default App;
