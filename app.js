const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'LONGLOUIS'


const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');

const audio = $('#audio');
const playingTime = $('.playing-time');
const durationTime = $('.duration-time');
const canvas = $('#canvas');

const playBtn = $('.btn-toggle-play');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const progress = $('#progress');
const volumeProgress = $('.volume-range');
const volumeValue = $('.volume-value-text');
const volumeUpbtn = $('.btn-volume-up');
const volumeDownbtn = $('.btn-volume-down');
const volumeMutebtn = $('.btn-volume-mute');

const playlist = $('.playlist-songs');

// Random lại 1 bài khi đã random hết playlist
let arrayRandom = [];
let lengthArrRandom = 0;

// Chạy một lần AudioContext
let runOnlyOnce = false;

const app = {
  currentIndex: 0,
  currentTime: 0,
  currentVolume: 1,
  volumeBeforeMuted: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isMuted: false,

  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

  songs: [
    {
      name: "Don't Wanna Know",
      singer: "Maroon 5_ Kendrick La",
      path: "./assets/music/Don_t Wanna Know - Maroon 5_ Kendrick La.m4a",
      image: "./assets/img/Dont-wanna-know.png"
    },
    {
      name: "Heartbreak Anniversary",
      singer: "Conor Maynard",
      path: "./assets/music/Heartbreak Anniversary - Conor Maynard.m4a",
      image: "./assets/img/Heartbreak-anniversary.png"
    },
    {
      name: "My Heart Will Go On",
      singer: "Celine Dion",
      path: "./assets/music/My Heart Will Go On - Celine Dion.m4a",
      image: "./assets/img/My-Heart-Will-Go-On.png"
    },
    {
      name: "Khi em lớn (English version)",
      singer: "Orange",
      path: "./assets/music/Khi Em Lon English Version_ - Orange.m4a",
      image: "./assets/img/Khi-em-lon.png"
    },
    {
      name: "Girls Like You",
      singer: "Maroon 5_ Cardi B",
      path: "./assets/music/Girls Like You - Maroon 5_ Cardi B.m4a",
      image: "./assets/img/Girl-like-you.png"
    },
    {
      name: "Muộn rồi mà sao còn",
      singer: "Sơn Tùng - MTP",
      path: "./assets/music/Muon Roi Ma Sao Con - Son Tung M-TP.m4a",
      image: "./assets/img/Muon-roi-ma-sao-con.png"
    },
    {
      name: "Astronaut In The Ocean (Remix)",
      singer: "Masked W",
      path: "./assets/music/Astronaut In The Ocean Remix_ - Masked W.m4a",
      image: "./assets/img/Astronaut-in-the-ocean.png"
    },
    {
      name: "Bad Liar",
      singer: "Imagine Dragons",
      path: "./assets/music/Bad Liar - Imagine Dragons.m4a",
      image: "./assets/img/bad-liar.png"
    },
    {
      name: "Beautiful Mistakes",
      singer: "Maroon 5_ Megan The",
      path: "./assets/music/Beautiful Mistakes - Maroon 5_ Megan The.m4a",
      image: "./assets/img/Beautiful-mistake.png"
    },
    {
      name: "Believers",
      singer: "Alan Walker_ Conor Maynard",
      path: "./assets/music/Believers - Alan Walker_ Conor Maynard.m4a",
      image: "./assets/img/Believer.png"
    },
    {
      name: "Let Me Down Slowly",
      singer: "Alec Benjamin",
      path: "./assets/music/Let Me Down Slowly - Alec Benjamin.m4a",
      image: "./assets/img/Let-me-down-slowly.png"
    },
    {
      name: "Why Not Me",
      singer: "Why Not Me - Enrique Iglesias",
      path: "./assets/music/Why Not Me - Enrique Iglesias.m4a",
      image: "./assets/img/why-not-me.png"
    },
  ],

  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
        <div class="thumb" style="background-image: url('${song.image}')">
        </div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>`;
    });
    playlist.innerHTML = htmls.join('');
  },
  // Getter
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      }
    });
  },

  handleEvents: function () {
    const cdwidth = cd.offsetWidth;
    const _this = this;

    // handle rotation of CD
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ], {
      duration: 10000, // 10s
      iterations: Infinity
    })
    cdThumbAnimate.pause();

    // handle zoom in/out CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdwidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdwidth;
    }

    // handle when click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    // when the song is played
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
      if (!runOnlyOnce) {
        _this.renderEqualizer();
        runOnlyOnce = true;
      }
    }
    // when the song is paused
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    }
    // get mins and secs when the song is played
    audio.onloadedmetadata = function () {
      const songDuration = _this.formatTime(audio.duration);
      durationTime.textContent = `${songDuration[0]}:${songDuration[1]}`;
    }
    // when the progress of song is changed
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
        progress.value = progressPercent;

        let timeNow = _this.formatTime(audio.currentTime);
        playingTime.textContent = `${timeNow[0]}:${timeNow[1]}`;
      }
    }
    // handle when rewind
    progress.oninput = function (e) {
      const seekTime = audio.duration / 100 * e.target.value;
      audio.currentTime = seekTime;
    }
    // when volume up / down
    volumeProgress.oninput = function (e) {
      audio.muted = false;
      audio.volume = e.target.value / 100;
      _this.currentVolume = audio.volume;
      volumeValue.textContent = Math.round(e.target.value);
      _this.changeIconVolume();
      _this.setConfig('currentVolume', _this.currentVolume);
    }
    // handle mute /unmute
    volumeMutebtn.onclick = function () {
      _this.changeStatusVolume();
    }
    volumeDownbtn.onclick = function () {
      _this.changeStatusVolume();
    }
    volumeUpbtn.onclick = function () {
      _this.changeStatusVolume();
    }
    // when next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.scrollToActiveSong();
    }
    // when prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.scrollToActiveSong();

    }
    // when random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    }
    // next song when the currentSong is ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    }
    // repeat song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    }
    // when click on playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option')) {
        // hanlde when click on song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
        }
      }
    }
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }, 250);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    // active CSS for currentSong
    this.setConfig('currentIndex', this.currentIndex);

    const listSong = $$('.song');
    listSong.forEach(song => {
      if (Number(song.dataset.index) === this.currentIndex) {
        song.classList.add('active');
      } else {
        song.classList.remove('active');
      }
    });
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.isMuted = this.config.isMuted;
    this.currentVolume = this.config.currentVolume;
    this.volumeBeforeMuted = this.config.volumeBeforeMuted;
    this.currentIndex = this.config.currentIndex || this.currentIndex;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex > this.songs.length - 1) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
      var isPlayedSongArr = arrayRandom.includes(newIndex);
    } while (isPlayedSongArr || newIndex === this.currentIndex);

    arrayRandom.push(newIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();

    if (arrayRandom.length === this.songs.length - 1) {
      arrayRandom = [];
      // lengthArrRandom = -1;
    }
    // lengthArrRandom++;
  },

  changeIconVolume: function () {
    if (this.currentVolume === 0) {
      volumeMutebtn.style.display = 'flex';
      volumeUpbtn.style.display = 'none';
      volumeDownbtn.style.display = 'none';
    } else if (this.currentVolume > 0 && this.currentVolume <= 0.59) {
      volumeMutebtn.style.display = 'none';
      volumeDownbtn.style.display = 'flex';
      volumeUpbtn.style.display = 'none';
    } else {
      volumeMutebtn.style.display = 'none';
      volumeDownbtn.style.display = 'none';
      volumeUpbtn.style.display = 'flex';
    }
  },

  changeStatusVolume: function () {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.volumeBeforeMuted = this.currentVolume;
      audio.muted = true;
      volumeProgress.value = 0;
      audio.volume = 0;
      this.currentVolume = 0;
    } else {
      audio.muted = false;
      this.currentVolume = this.volumeBeforeMuted;
      volumeProgress.value = this.currentVolume * 100;
      audio.volume = this.currentVolume;
    }
    volumeValue.textContent = Math.round(this.currentVolume * 100);
    this.setConfig('volumeBeforeMuted', this.volumeBeforeMuted);
    this.setConfig('isMuted', this.isMuted);
    this.setConfig('currentVolume', this.currentVolume);
    this.changeIconVolume();
  },

  formatTime: function (time) {
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    const getMins = mins < 10 ? `0${mins}` : mins;
    const getSecs = secs < 10 ? `0${secs}` : secs;
    return [getMins, getSecs];
  },

  renderEqualizer: function () {
    const _this = this;
    var BAR_PAD = 10;
    var BAR_WIDTH = 5;
    var MAX_BARS = 80;

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it
    var source = audioCtx.createMediaElementSource(audio);

    var analyser = audioCtx.createAnalyser();

    // canvas.width = window.innerWidth * 0.8
    // canvas.height = window.innerHeight * 0.34

    canvas.width = 800;
    canvas.height = 340;

    var ctx = canvas.getContext("2d");

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);
    // console.log(bufferLength)

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      var len = dataArray.length - (Math.floor(dataArray.length / MAX_BARS) * 4);
      var maxValue = 255;
      var step = Math.floor(len / MAX_BARS);
      var quantityDot = (WIDTH / MAX_BARS) * 1.2;
      var x = BAR_WIDTH;
      var height = (HEIGHT - (BAR_PAD * 2));

      for (var i = 0; i < len; i += step) {
        var v = (dataArray[i] / maxValue);
        var h = v * height;
        var y = height / 2 - h / 2;
        ctx.beginPath();
        if (_this.config.theme === "dark") {
          ctx.shadowColor = "rgba(255, 255, 254, 0.8)";
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        } else {
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
        }
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;
        ctx.lineWidth = BAR_WIDTH;
        ctx.lineCap = 'round';
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();
        x += quantityDot + 1;
      }
    }
    renderFrame();
  },

  changeTheme: function () {
    const _this = this
    const toggleSwitch = $('.theme-switch input[type="checkbox"]');
    const currentTheme = this.config.theme;

    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme);

      if (currentTheme === "dark") {
        toggleSwitch.checked = true;
      }
    }

    function switchTheme(e) {
      if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        _this.setConfig('theme', "dark");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
        _this.setConfig('theme', "light");
      }
    }

    toggleSwitch.addEventListener("change", switchTheme, false);
  },

  start: function () {
    // assign configurations into app
    this.loadConfig();
    // define properties for object
    this.defineProperties();
    // listen / handle events (DOM events)
    this.handleEvents();
    // upload the info of first song into UI when play
    this.loadCurrentSong();
    // render playlist
    this.render();
    // change theme bright / dark
    this.changeTheme();
    // turn on randomBtn & repeatBtn
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);

    volumeProgress.value = (this.currentVolume * 100);
    audio.volume = this.currentVolume;
    volumeValue.textContent = Math.round(volumeProgress.value);

    this.changeIconVolume();
  }
};

app.start();