'use strict'

const db = require('../config/db')

//DB에 저장된 값들을 불러오기 위한 query문 불러오기
class UserStorage {
  static getUserInfo(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?;'
      db.query(query, [email], (err, data) => {
        if (err) reject(`${err}`)
        resolve(data[0])
      })
    })
  }

  static getUserNickName(data) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as cnt FROM users WHERE nickname = ?;'
      db.query(query, [data], (err, data) => {
        if (err) reject(`${err}`)
        resolve({ cnt: data[0], type: '닉네임' })
      })
    })
  }

  static getUserEmail(data) {
    return new Promise((resolve, reject) => {
      // console.log(data)
      const query = 'SELECT COUNT(*) AS cnt FROM users WHERE email = ?;'
      db.query(query, [data], (err, data) => {
        if (err) reject(`${err}`)
        resolve({ cnt: data[0], type: '이메일' })
      })
    })
  }

  //회원가입 시 INSERT문을 이용해 DB에 값들 저장
  static async save(userInfo) {
    return new Promise((resolve, reject) => {
      const query =
        'INSERT INTO users(email, name, psword, nickname, birth) VALUES(?, ?, ?, ?, ?);'
      db.query(
        query,
        [
          userInfo.email,
          userInfo.name,
          userInfo.psword,
          userInfo.nickname,
          userInfo.birth,
        ],
        (err) => {
          if (err) reject(`${err}`)
          resolve({ success: true })
        }
      )
    })
  }
}

module.exports = UserStorage
