'use strict'

const nickname = document.querySelector('#nickname'),
  name = document.querySelector('#name'),
  psword = document.querySelector('#psword'),
  email = document.querySelector('#email'),
  confirmPsword = document.querySelector('#confirm-psword'),
  birth = document.querySelector('#birth'),
  registerBtn = document.querySelector('#button')

registerBtn.addEventListener('click', register)

function chkPW(pw) {
  //정규화식
  const num = pw.search(/[0-9]/g)
  const eng = pw.search(/[a-z]/gi)
  const spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi)

  //비밀번호 유효성 검사 정규화
  // if (pw.length < 8 || pw.length > 25) {
  //   alert('비밀번호를 8자리 ~ 25자리 이내로 입력해주세요.')
  //   return false}
  if (pw.search(/\s/) != -1) {
    alert('비밀번호는 공백 없이 입력해주세요.')
    return false
  }
  // } else if (num < 0 || eng < 0 || spe < 0) {
  //   alert('영문,숫자,특수문자를 혼합하여 입력해주세요.')
  //   return false}
  else {
    console.log('통과')
    return true
  }
}

//회원가입 로직
function register() {
  var regExp =
    /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
  if (!regExp.test(email.value)) {
    alert('이메일 형식에 맞춰서 입력하세요.')
    email.focus()
    return false
  } else if (!name.value) {
    alert('이메일을 입력해주세요.')
    name.focus()
    return false
  } else if (!name.value) {
    alert('이름을 입력해주세요.')
    name.focus()
    return false
  } else if (!psword.value) {
    alert('비밀번호를 입력해주세요.')
    psword.focus()
  } else if (!nickname.value) {
    alert('닉네임을 입력해주세요.')
    nickname.focus()
    return false
  } else if (!chkPW(psword.value)) {
    return false
  } else if (psword.value !== confirmPsword.value) {
    alert('비밀번호가 서로 맞지 않습니다.')
    return false
  } else if (!birth.value) {
    alert('생년월일을 입력해주세요.')
    birth.focus()
    return false
  } else if (!agr1.checked) {
    alert('이용약관을 동의해주세요.')
    agr1.focus()
    return false
  } else if (!agr2.checked) {
    alert('개인정보 취급 방침을 동의해주세요.')
    agr2.focus()
    return false
  } else {
    const req = {
      nickname: nickname.value,
      name: name.value,
      email: email.value,
      psword: psword.value,
      birth: birth.value,
    }

    //fetch를 통해 성공하면 POST형식으로 불러옴
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          location.href = '/login'
        } else {
          alert(res.msg)
        }
      })
      .catch((err) => {
        console.error(new Error('회원가입 중 에러 발생'))
      })
  }
}

//이메일, 닉네임 중복 체크
const overlapCheck = (checkType) => {
  var req

  if (checkType === 'nickname') {
    req = {
      id: nickname.value,
      checkType: checkType,
    }
  } else if (checkType === 'email') {
    req = {
      id: email.value,
      checkType: checkType,
    }
  }
  console.log(req)
  //fetch를 통해 성공하면 POST형식으로 불러옴, 실패시 alert창
  fetch('/overlapCheck', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
      if (res.cnt.cnt === 0) {
        alert('사용 가능한  ' + res.type + '  입니다.')
      } else {
        alert('중복된  ' + res.type + '  입니다.')
        email.value = ''
        nickname.value = ''
      }
    })
    .catch((err) => {
      console.error()
    })
}
