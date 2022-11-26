var audio = document.querySelector('audio')
let context, processor
context = new AudioContext();
processor = context.createScriptProcessor(1024, 1, 1);

var wavesurfer = WaveSurfer.create({
  container: '#waveform',
  barWidth: 5,
  waveColor: 'pink',
  progressColor: 'hotpink',
});
var wavesurfer2 = WaveSurfer.create({
  container: '#waveform2',
  barWidth: 5,
  waveColor: '#D2EDD4',
  progressColor: '#46B54D',
  audioContext: context || null,
  audioScriptProcessor: processor || null,
  plugins: [WaveSurfer.microphone.create()]

});
wavesurfer.load('video/sorrow.wav');
wavesurfer2.microphone.on('deviceReady', function () {
  console.info('Device ready!');
});

// console.log(wavesurfer.microphone)
// var microphone = Object.create(wavesurfer.microphone);

// microphone.init({
//   wavesurfer: wavesurfer
// });

// microphone.on('deviceReady', function(stream) {
//   console.log('Device ready!', stream);
// });
// microphone.on('deviceError', function(code) {
//   console.warn('Device error: ' + code);
// });

//미디어 스트림 불러오기
function captureMicrophone(callback) {
  btnReleaseMicrophone.disabled = false

  if (microphone) {
    callback(microphone)
    return
  }

  if (
    typeof navigator.mediaDevices === 'undefined' ||
    !navigator.mediaDevices.getUserMedia
  ) {
    alert('This browser does not supports WebRTC getUserMedia API.')

    if (!!navigator.getUserMedia) {
      alert('This browser seems supporting deprecated getUserMedia API.')
    }
  }

  navigator.mediaDevices
    .getUserMedia({
      audio: isEdge
        ? true
        : {
          echoCancellation: false,
        },
    })
    .then(function (mic) {
      callback(mic)
    })
    .catch(function (error) {
      alert('Unable to capture your microphone. Please check console logs.')
      console.error(error)
    })
}

function replaceAudio(src) {
  var newAudio = document.createElement('audio')
  newAudio.controls = true
  newAudio.autoplay = true

  if (src) {
    newAudio.src = src
  }

  var parentNode = audio.parentNode
  parentNode.innerHTML = ''
  parentNode.appendChild(newAudio)

  audio = newAudio
}

function stopRecordingCallback() {
  replaceAudio(URL.createObjectURL(recorder.getBlob()))

  btnStartRecording.disabled = false

  setTimeout(function () {
    if (!audio.paused) return

    setTimeout(function () {
      if (!audio.paused) return
      audio.play()
    }, 1000)

    audio.play()
  }, 300)

  audio.play()

  btnDownloadRecording.disabled = false

  if (isSafari) {
    click(btnReleaseMicrophone)
  }
}

var isEdge =
  navigator.userAgent.indexOf('Edge') !== -1 &&
  (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob)
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

var recorder // globally accessible
var microphone

var btnStartRecording = document.getElementById('btn-start-recording')
var btnStopRecording = document.getElementById('btn-stop-recording')
var btnReleaseMicrophone = document.querySelector('#btn-release-microphone')
var btnDownloadRecording = document.getElementById('btn-download-recording')
var btnFileRecording = document.getElementById('btn-file-recording')
var btnUploadRecording = document.getElementById('btn-upload-recording')
const BLUR_LEVELS = 4
const MAX_BLUR = 2
const VERSE_INTERVAL = 2500

const lyrics = document.querySelector('.lyrics')
const lyricsWrapper = document.querySelector('.lyrics-wrapper')
const lyricsBg = document.querySelector('.lyrics-bg')

btnStartRecording.onclick = function () {


  ////////////////////////가사 스크롤 코드

  setTimeout(function () {

    let currentVerseIdx = null

    function scrollLyricsToVerse(verse) {
      const scrollOffset = Math.floor(lyricsWrapper.clientHeight * 0.2)
      const versePosition = verse.offsetTop - scrollOffset

      lyricsWrapper.scrollTop = versePosition
    }

    function setVerse(verseIdx) {
      const currentVerse = lyrics.children[currentVerseIdx]
      const newVerse = lyrics.children[verseIdx]
      if (currentVerse) {
        currentVerse.classList.remove('highlight')
      }
      if (newVerse) {
        scrollLyricsToVerse(newVerse)
        newVerse.classList.add('highlight')
      }
      for (let i = 0; i < lyrics.children.length; i++) {
        const verse = lyrics.children[i]
        const dist = Math.abs(i - verseIdx)
        const blurLevel = Math.min(dist, BLUR_LEVELS)
        if (verse === newVerse) {
          verse.style = ''
        } else {
          verse.style.textShadow = `0 0 ${blurLevel}px var(--text-color)`
        }
      }
      currentVerseIdx = verseIdx
    }

    function incrementVerse(amount) {
      const newVerseIdx = Math.max(
        0,
        (currentVerseIdx + amount) % lyrics.children.length
      )
      setVerse(newVerseIdx)
    }

    setVerse(0)
    setInterval(() => {
      incrementVerse(1)
    }, VERSE_INTERVAL)
  }, 100)

  ////////////////가사 스크를 끝
  this.disabled = true
  this.style.border = ''
  this.style.fontSize = ''

  if (!microphone) {
    captureMicrophone(function (mic) {
      microphone = mic

      if (isSafari) {
        replaceAudio()

        audio.muted = true
        audio.srcObject = microphone

        btnStartRecording.disabled = false
        btnStartRecording.style.border = '1px solid red'
        btnStartRecording.style.fontSize = '150%'

        alert(
          'Please click startRecording button again. First time we tried to access your microphone. Now we will record it.'
        )
        return
      }

      click(btnStartRecording)
    })
    return
  }

  replaceAudio();
  wavesurfer.playPause();
  wavesurfer2.microphone.start();
  lyricsWrapper.style.visibility == 'visible'


  audio.muted = true
  audio.srcObject = microphone

  var options = {
    type: 'audio',
    numberOfAudioChannels: isEdge ? 1 : 2,
    checkForInactiveTracks: true,
    bufferSize: 16384,
  }

  if (isSafari || isEdge) {
    options.recorderType = StereoAudioRecorder
  }

  if (
    navigator.platform &&
    navigator.platform.toString().toLowerCase().indexOf('win') === -1
  ) {
    options.sampleRate = 48000 // or 44100 or remove this line for default
  }

  if (isSafari) {
    options.sampleRate = 44100
    options.bufferSize = 4096
    options.numberOfAudioChannels = 2
  }

  if (recorder) {
    recorder.destroy()
    recorder = null
  }

  recorder = RecordRTC(microphone, options)

  recorder.startRecording()

  btnStopRecording.disabled = false
  btnDownloadRecording.disabled = true
}



btnStopRecording.onclick = function () {
  this.disabled = true
  recorder.stopRecording(stopRecordingCallback)

  wavesurfer.stop();
  wavesurfer2.microphone.stop();

  lyricsWrapper.style.visibility = 'hidden';

}

btnReleaseMicrophone.onclick = function () {
  this.disabled = true
  btnStartRecording.disabled = false

  if (microphone) {
    microphone.stop()
    microphone = null
  }

  if (recorder) {
    // click(btnStopRecording);
  }
}

btnDownloadRecording.onclick = function () {
  this.disabled = true
  btnFileRecording.disabled = false
  btnUploadRecording.disabled = false
  if (!recorder || !recorder.getBlob()) return

  if (isSafari) {
    recorder.getDataURL(function (dataURL) {
      SaveToDisk(dataURL, getFileName('wav'))
    })
    return
  }

  var blob = recorder.getBlob()
  var file = new File([blob], getFileName('wav'), {
    type: 'audio/wav',
  })

  // var data = new FormData()

  // data.append('file', file)
  // console.log(data);

  // //fetch를 통해 성공하면 POST형식으로 불러옴
  // fetch('/record/fileUpload', {
  //   method: 'POST',
  //   body: data,
  // })
  //   .then((res) => res.json())
  //   .then((res) => {
  //     if (res.success) {
  //       alert("success");
  //     } else {
  //       alert(res.msg)
  //     }
  //   })
  //   .catch((err) => {
  //     console.error(new Error('회원가입 중 에러 발생'))
  //   })
  invokeSaveAsDialog(file)
}

function click(el) {
  el.disabled = false // make sure that element is not disabled
  var evt = document.createEvent('Event')
  evt.initEvent('click', true, true)
  el.dispatchEvent(evt)
}

function getRandomString() {
  if (
    window.crypto &&
    window.crypto.getRandomValues &&
    navigator.userAgent.indexOf('Safari') === -1
  ) {
    var a = window.crypto.getRandomValues(new Uint32Array(3)),
      token = ''
    for (var i = 0, l = a.length; i < l; i++) {
      token += a[i].toString(36)
    }
    return token
  } else {
    return (Math.random() * new Date().getTime())
      .toString(36)
      .replace(/\./g, '')
  }
}

function getFileName(fileExtension) {
  var d = new Date()
  var year = d.getFullYear()
  var month = d.getMonth()
  var date = d.getDate()
  return (
    'RecordRTC-' +
    year +
    month +
    date +
    '-' +
    getRandomString() +
    '.' +
    fileExtension
  )
}

function SaveToDisk(fileURL, fileName) {
  // for non-IE
  if (!window.ActiveXObject) {
    var save = document.createElement('a')
    save.href = fileURL
    save.download = fileName || 'unknown'
    save.style = 'display:none;opacity:0;color:transparent;'
      ; (document.body || document.documentElement).appendChild(save)

    if (typeof save.click === 'function') {
      save.click()
    } else {
      save.target = '_blank'
      var event = document.createEvent('Event')
      event.initEvent('click', true, true)
      save.dispatchEvent(event)
    }

    ; (window.URL || window.webkitURL).revokeObjectURL(save.href)
  }

  // for IE
  else if (!!window.ActiveXObject && document.execCommand) {
    var _window = window.open(fileURL, '_blank')
    _window.document.close()
    _window.document.execCommand('SaveAs', true, fileName || fileURL)
    _window.close()
  }
}

btnUploadRecording.onclick = function () {
  var fileCheck = document.getElementById("btn-file-recording").value;
  if (!fileCheck) {
    alert("파일을 선택해주세요");
    return false;
  }
}