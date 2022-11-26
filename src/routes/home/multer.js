//로그인, 회원가입 컨트롤러 기능
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'carpeDM'
const db = require('../../config/db')
const express = require('express')
const router = express.Router()
//멀터
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
//멀터

router.post('/login'),
  async (req, res) => {
    const user = new User(req.body)
    const response = await user.login()
    //받은 요청의 id와 password로 DB에서 프로필사진, 닉네임 등 로그인 정보를 가져온다.
    console.log(response)
    //jwt.sign(payload, secretOrPrivateKey, [options, callback])
    const token = jwt.sign(
      {
        type: 'JWT',
        email: response.email,
        user_idx: response.user_idx,
        nickname: response.nickname,
      },
      SECRET_KEY,
      {
        expiresIn: '24h', // 만료시간 15분
        issuer: 'carpedm_dain',
      }
    )

    //쿠키에 토큰값 넣어주기
    res.cookie('token', token)
    //response
    return res.status(200).json({
      success: true,
      code: 200,
      message: '토큰이 발급되었습니다.',
      token: token,
      info: {
        eamil: User.email,
        user_idx: User.user_idx,
      },
    })
  },
  router.get('/', function (req, res) {
    res.render('home/myinfo_write')
  })
const upload = multer({
  storage: multer.diskStorage({
    // 파일 저장 경로
    destination(req, file, cb) {
      cb(null, './src/public/uploadimages/')
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname) // 파일 확장자
      const timestamp = new Date().getTime().valueOf() // 현재 시간
      // 새 파일(기존파일명 + 시간 + 확장자)
      const filename = path.basename(file.originalname, ext) + timestamp + ext
      cb(null, filename)
    },
  }),
})
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ filename: `${req.file.filename}` })
})
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    sharp(req.file.path) // 압축이미지경로
      .resize({ width: 600 }) // 비율을 유지하며 가로 크기 줄이기
      .withMetadata() // 이미지의 exif데이터 유지
      .toBuffer((err, buffer) => {
        if (err) throw err
        // 압축된 파일 새로 덮어씌움
        fs.writeFile(req.file.path, buffer, (err) => {
          if (err) throw err
        })
      })
  } catch (err) {
    console.log(err)
  }
  res.json({ filename: `${req.file.filename}` })
})
router.post('/', upload.single('image'), function (req, res, next) {
  var userid = req.cookies.token
  let decoded = jwt.verify(userid, SECRET_KEY)
  let user_idx = decoded.user_idx
  var content = req.body.text
  var image = `./uploadimages/${req.file.filename}`

  var sql =
    'update users set content=?, image=? where user_idx = ? '
  var datas = [content, image,user_idx]

  db.query(sql, datas, function (err, rows, fields) {
    if (err) console.error('err:' + err)
    res.redirect('myinfo')
  })
})

module.exports = router
