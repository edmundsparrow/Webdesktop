/* BEGIN media.js */
// media.js - Media Player with playlist and folder indexing.
(function() {
  window.MediaPlayerApp = {
    playlist: [],
    currentFileIndex: -1,

    open() {
      const playerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #000;
          color: #fff;
          font-family: 'Segoe UI', sans-serif;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: rgba(43, 87, 151, 0.9);
            backdrop-filter: blur(10px);
            position: relative;
          ">
            <div id="media-title" style="
              font-weight: bold;
              font-size: 14px;
              flex-grow: 1;
              margin-right: 10px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">No media loaded</div>
            <div style="display:flex;gap:4px;">
              <button id="prev-btn" style="
                padding: 4px 8px;
                border: none;
                background: transparent;
                color: #fff;
                cursor: pointer;
                font-size: 11px;
              ">⏮️ Prev</button>
              <button id="next-btn" style="
                padding: 4px 8px;
                border: none;
                background: transparent;
                color: #fff;
                cursor: pointer;
                font-size: 11px;
              ">Next ⏭️</button>
            </div>
          </div>
          
          <div id="player-container" style="
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div id="no-media" style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100%;
              color: rgba(255,255,255,0.6);
              text-align: center;
              padding: 20px;
            ">
              <h3 style="margin: 0 0 10px; font-size: 18px;">🎶 Media Player 🎬</h3>
              <p>Supports a wide range of audio and video formats.</p>
              <p>Click "Load Folder" to get started</p>
            </div>
            
            <video id="video-player" controls style="
              width: 100%;
              height: 100%;
              background: #000;
              display: none;
            " preload="metadata"></video>
            
            <audio id="audio-player" controls style="display:none; width: 80%; margin-top: auto;"></audio>
            
            <div id="audio-visualizer" style="
              width: 100%;
              height: 150px;
              background: radial-gradient(ellipse at center, #2b5797 0%, #1a365d 100%);
              display: none;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                display: flex;
                gap: 3px;
                align-items: end;
                height: 40px;
                margin-bottom: 10px;
              ">
                ${Array.from({length: 9}).map((_, i) => `
                  <div style="
                    width: 4px;
                    height: ${10 + Math.random() * 20}px;
                    background: #fff;
                    border-radius: 2px;
                    animation: equalizer 1.5s ease-in-out infinite alternate;
                    animation-delay: -${i * 0.2}s;
                  "></div>
                `).join('')}
              </div>
              <div id="visualizer-title" style="font-size: 16px; font-weight: bold; text-align: center; opacity: 0.8;">
                ♪ Audio Mode ♪
              </div>
            </div>
            
            <div id="playlist-container" style="
              height: 100%;
              width: 250px;
              background: rgba(0,0,0,0.5);
              backdrop-filter: blur(10px);
              position: absolute;
              top: 0;
              right: 0;
              padding: 10px;
              overflow-y: auto;
              transition: transform 0.3s ease-in-out;
              transform: translateX(100%);
            ">
              <h4 style="margin: 0 0 10px; font-size: 14px; color: #fff;">Playlist</h4>
              <ul id="playlist-list" style="list-style: none; padding: 0; margin: 0;"></ul>
            </div>
          </div>
          
          <div style="
            padding: 12px;
            background: rgba(43, 87, 151, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            gap: 8px;
          ">
            <div style="display: flex; align-items: center; gap: 10px;">
              <button id="load-folder" style="
                padding: 6px 10px;
                background: rgba(76, 175, 80, 0.8);
                border: 1px solid rgba(76, 175, 80, 1);
                border-radius: 4px;
                color: #fff;
                cursor: pointer;
                font-size: 11px;
              ">📁 Load Folder</button>
              
              <div id="av-controls" style="display: flex; gap: 10px;">
                <button id="play-pause" style="
                  padding: 6px 10px;
                  background: rgba(255,255,255,0.1);
                  border: 1px solid rgba(255,255,255,0.2);
                  border-radius: 4px;
                  color: #fff;
                  cursor: pointer;
                  font-size: 11px;
                ">▶️ Play</button>
                <button id="stop-btn" style="
                  padding: 6px 10px;
                  background: rgba(255,255,255,0.1);
                  border: 1px solid rgba(255,255,255,0.2);
                  border-radius: 4px;
                  color: #fff;
                  cursor: pointer;
                  font-size: 11px;
                ">⏹️ Stop</button>
              </div>
              
              <div style="
                margin-left: auto;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
              ">
                <span>Volume:</span>
                <input type="range" id="volume-slider" min="0" max="100" value="50" style="width: 80px;">
                <span id="volume-display">50%</span>
              </div>
            </div>
          </div>
        </div>

        <style>
          @keyframes equalizer {
            0% { height: 5px; opacity: 0.3; }
            100% { height: 35px; opacity: 1; }
          }
          #playlist-container.visible {
            transform: translateX(0%);
          }
        </style>
      `;

      const win = WindowManager.createWindow('Media Player', playerHTML, 600, 500);
      this.setupPlayer(win);
      return win;
    },

    setupPlayer(win) {
      const loadBtn = win.querySelector('#load-folder');
      const playPauseBtn = win.querySelector('#play-pause');
      const stopBtn = win.querySelector('#stop-btn');
      const prevBtn = win.querySelector('#prev-btn');
      const nextBtn = win.querySelector('#next-btn');
      const volumeSlider = win.querySelector('#volume-slider');
      const volumeDisplay = win.querySelector('#volume-display');
      const mediaTitle = win.querySelector('#media-title');
      const videoPlayer = win.querySelector('#video-player');
      const audioPlayer = win.querySelector('#audio-player');
      const audioVisualizer = win.querySelector('#audio-visualizer');
      const noMedia = win.querySelector('#no-media');
      const playlistContainer = win.querySelector('#playlist-container');
      const playlistList = win.querySelector('#playlist-list');

      let currentMediaElement = null;

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.webkitdirectory = true;

      const visualizerTitle = win.querySelector('#visualizer-title');

      const supportedMediaTypes = {
        video: ['mp4', 'webm', 'mov', 'avi'],
        audio: ['mp3', 'wav', 'ogg']
      };

      function isSupported(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        return supportedMediaTypes.video.includes(ext) || supportedMediaTypes.audio.includes(ext);
      }

      function renderPlaylist() {
        playlistList.innerHTML = '';
        if (MediaPlayerApp.playlist.length > 0) {
          MediaPlayerApp.playlist.forEach((file, index) => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.style.cssText = `
              padding: 8px;
              cursor: pointer;
              font-size: 12px;
              border-bottom: 1px solid rgba(255,255,255,0.1);
              transition: background 0.2s;
            `;
            li.onmouseover = () => li.style.background = 'rgba(255,255,255,0.2)';
            li.onmouseout = () => li.style.background = 'transparent';
            li.onclick = () => {
              MediaPlayerApp.currentFileIndex = index;
              playCurrentMedia();
            };
            playlistList.appendChild(li);
          });
          playlistContainer.classList.add('visible');
        } else {
          playlistContainer.classList.remove('visible');
        }
      }

      function playCurrentMedia() {
        if (MediaPlayerApp.currentFileIndex < 0 || MediaPlayerApp.currentFileIndex >= MediaPlayerApp.playlist.length) {
          return;
        }

        const file = MediaPlayerApp.playlist[MediaPlayerApp.currentFileIndex];
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');

        // Stop any currently playing media
        if (currentMediaElement) {
          currentMediaElement.pause();
          currentMediaElement.style.display = 'none';
        }
        audioVisualizer.style.display = 'none';
        noMedia.style.display = 'none';

        if (isVideo) {
          currentMediaElement = videoPlayer;
          videoPlayer.style.display = 'block';
        } else {
          currentMediaElement = audioPlayer;
          audioPlayer.style.display = 'block';
          audioVisualizer.style.display = 'flex';
          visualizerTitle.textContent = file.name;
        }

        currentMediaElement.src = url;
        currentMediaElement.play();
        mediaTitle.textContent = file.name;
        playPauseBtn.textContent = '⏸️ Pause';
      }

      // Event listeners
      loadBtn.onclick = () => fileInput.click();
      
      fileInput.onchange = (e) => {
        const files = Array.from(e.target.files);
        MediaPlayerApp.playlist = files.filter(file => isSupported(file.name)).sort((a,b) => a.name.localeCompare(b.name));
        
        if (MediaPlayerApp.playlist.length > 0) {
          MediaPlayerApp.currentFileIndex = 0;
          renderPlaylist();
          playCurrentMedia();
        } else {
          noMedia.style.display = 'flex';
          mediaTitle.textContent = 'No media loaded';
          playlistContainer.classList.remove('visible');
        }
      };

      playPauseBtn.onclick = () => {
        if (currentMediaElement) {
          if (currentMediaElement.paused) {
            currentMediaElement.play();
            playPauseBtn.textContent = '⏸️ Pause';
          } else {
            currentMediaElement.pause();
            playPauseBtn.textContent = '▶️ Play';
          }
        }
      };

      stopBtn.onclick = () => {
        if (currentMediaElement) {
          currentMediaElement.pause();
          currentMediaElement.currentTime = 0;
          playPauseBtn.textContent = '▶️ Play';
        }
      };

      prevBtn.onclick = () => {
        if (MediaPlayerApp.currentFileIndex > 0) {
          MediaPlayerApp.currentFileIndex--;
          playCurrentMedia();
        }
      };

      nextBtn.onclick = () => {
        if (MediaPlayerApp.currentFileIndex < MediaPlayerApp.playlist.length - 1) {
          MediaPlayerApp.currentFileIndex++;
          playCurrentMedia();
        }
      };

      volumeSlider.oninput = () => {
        const volume = volumeSlider.value / 100;
        if (currentMediaElement) currentMediaElement.volume = volume;
        volumeDisplay.textContent = volumeSlider.value + '%';
      };

      // Handle media ending
      videoPlayer.onended = () => {
        MediaPlayerApp.currentFileIndex++;
        if (MediaPlayerApp.currentFileIndex < MediaPlayerApp.playlist.length) {
          playCurrentMedia();
        } else {
          playPauseBtn.textContent = '▶️ Play';
        }
      };
      audioPlayer.onended = () => {
        MediaPlayerApp.currentFileIndex++;
        if (MediaPlayerApp.currentFileIndex < MediaPlayerApp.playlist.length) {
          playCurrentMedia();
        } else {
          playPauseBtn.textContent = '▶️ Play';
        }
      };

      // Set initial state
      noMedia.style.display = 'flex';
    }
  };

  // Register app with the system
  if (typeof AppRegistry !== 'undefined') {
    AppRegistry.registerApp({
      id: 'media',
      name: 'Media Player',
      icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><circle cx='24' cy='24' r='20' fill='%232b5797'/><path d='M19 15l12 9-12 9z' fill='%23fff'/><rect x='16' y='30' width='16' height='2' fill='%23fff'/></svg>",
      handler: () => window.MediaPlayerApp.open()
    });
  }
})();
/*
//documentation
{
  "name": "Media Player",
  "version": "1.1",
  "description": "A media player application that handles audio and video playback. It can index all supported media files from a user-selected folder, creating a dynamic playlist.",
  "features": [
    "Load an entire folder of media files at once.",
    "Dynamic playlist generation from supported files.",
    "Playback controls: play, pause, stop, previous, and next track.",
    "Volume control.",
    "Video and audio visualizer modes.",
    "Support for common video (MP4, WebM) and audio (MP3, WAV) formats."
  ],
  "dependencies": [
    "WindowManager",
    "AppRegistry"
  ],
  "public_methods": [
    {
      "name": "open",
      "description": "Initializes and opens the main Media Player window."
    }
  ],
  "notes": "This application leverages the browser's File System Access API with 'webkitdirectory' for folder selection. The player's state and playlist are managed locally, and the user interface adapts based on the type of media being played."
}
*/
