'use strict'

//querySelector를 통해 각 변수에 값들 가져와 저장
const email = document.querySelector('#email'),
  psword = document.querySelector('#psword'),
  loginBtn = document.querySelector('#button')

loginBtn.addEventListener('click', login)

function login() {
  const req = {
    email: email.value,
    psword: psword.value,
  }

  //fetch를 통해 성공하면 POST형식으로 불러옴, 실패시 에러 콘솔창
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        location.href = '/'
      } else {
        alert('로그인 정보가 틀렸습니다.')
      }
    })
    .catch((err) => {
      console.error(new Error('로그인 중 에러 발생'))
    })
}
