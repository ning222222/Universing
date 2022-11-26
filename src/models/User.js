const UserStorage = require('./UserStorage')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'carpeDM'

class User {
  constructor(body) {
    this.body = body
  }

  async login() {
    const client = this.body
    try {
      const { email, psword, user_idx, nickname } =
        await UserStorage.getUserInfo(client.email)
      if (email) {
        if (email === client.email && psword === client.psword) {
          return {
            success: true,
            email: client.email,
            user_idx: user_idx,
            nickname: nickname,
          }
        }
        return { success: false, msg: '비밀번호가 틀렸습니다.' }
      }
    } catch (err) {
      return { success: false, msg: err.message }
    }
  }

  register() {
    const client = this.body
    const response = UserStorage.save(client)
    return response
  }

  //저장된 정보로 로그인 시도를 했는 지 확인하는 작업
  async overlapCheck(checkType) {
    const client = this.body
    try {
      // const response = await UserStorage.getUserID(client.id)
      if (checkType === 'email') {
        const email = await UserStorage.getUserEmail(client.id)
        console.log(client)
        return email
      } else if (checkType === 'nickname') {
        const nickname = await UserStorage.getUserNickName(client.id)
        console.log(client)
        return nickname
      }
    } catch (err) {
      return { success: false, alert: '존재하지 않는 이메일입니다.' }
    }
  }
}

module.exports = User
