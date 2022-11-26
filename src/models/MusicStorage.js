'use strict'

const db = require('../config/db')

//DB에 저장된 값들을 불러오기 위한 query문 불러오기
class MusicStorage {
  static getMusicList() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM music_list;'
      db.query(query, (err, data) => {
        if (err) reject(`${err}`)
        resolve(data[0])
      })
    })
  }
}

module.exports = UserStorage
