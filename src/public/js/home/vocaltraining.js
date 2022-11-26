// document.addEventListener('DOMContentLoaded', function () {
//   // audio, button 태그 취득
//   const $audioEl = document.getElementById('adio')
//   const $btn = document.getElementById('btn')
//   console.log($btn)
//   // 녹음 상태 체크용 변수
//   let isRecording = false

//   // MediaRecorder 변수 생성
//   let mediaRecorder = null

//   // 녹음 데이터(Blob) 조각 저장 배열
//   const audioArray = []

//   // 녹음 시작/종료 버튼 클릭 이벤트 처리`
//   $btn.onclick = async function (event) {
//     // 녹음 중이 아닌 경우에만 녹음 시작 처리
//     if (!isRecording) {
//       // 마이크 mediaStream 생성: Promise를 반환하므로 async/await 사용
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       })

//       // MediaRecorder 생성: 마이크 MediaStream을 인자로 입력
//       mediaRecorder = new MediaRecorder(mediaStream)

//       // 이벤트핸들러: 녹음 데이터 취득 처리
//       mediaRecorder.ondataavailable = (event) => {
//         audioArray.push(event.data) // 오디오 데이터가 취득될 때마다 배열에 담아둔다.
//       }

//       // 이벤트핸들러: 녹음 종료 처리 & 재생하기
//       mediaRecorder.onstop = (event) => {
//         // 녹음이 종료되면, 배열에 담긴 오디오 데이터(Blob)들을 합친다: 코덱도 설정해준다.
//         const blob = new Blob(audioArray, { type: 'audio/ogg codecs=opus' })
//         audioArray.splice(0) // 기존 오디오 데이터들은 모두 비워 초기화한다.

//         // Blob 데이터에 접근할 수 있는 객체URL을 생성한다.
//         const blobURL = window.URL.createObjectURL(blob)

//         // audio엘리먼트로 재생한다.
//         $audioEl.src = blobURL
//         $audioEl.play()
//       }

//       // 녹음 시작
//       mediaRecorder.start()
//       isRecording = true
//     } else {
//       // 녹음 종료
//       mediaRecorder.stop()
//       isRecording = false
//       ㅋ
//     }
//   }
//   //버튼 토글을 위한 js코드 녹음과는 상관없음
//   var play = document.getElementById('player')
//   play.addEventListener('click', function (play) {
//     play.target.classList.toggle('stop')
//   })

//   // plyr.setup();

//   document.addEventListener('DOMContentLoaded', () => {
//     const players = Plyr.setup('.js-player')
//   })
// })

function music_btn() {
   setTimeout(function () {
    const BLUR_LEVELS = 4
    const MAX_BLUR = 2
    const VERSE_INTERVAL = 2500

    const lyrics = document.querySelector('.lyrics')
    const lyricsWrapper = document.querySelector('.lyrics-wrapper')
    const lyricsBg = document.querySelector('.lyrics-bg')
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
}
console.log(as)