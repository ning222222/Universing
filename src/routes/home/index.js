'use strict'

//경로설정
const express = require('express')
const router = express.Router()
const path = require('path')
const ctrl = require('./home.ctrl')
const { auth } = require('../../middleware/authMiddleware')
const db = require('../../config/db')
const axios = require('axios')

const fs = require('fs')
const multer = require('multer')

var storage = multer.diskStorage({
  // 2
  destination(req, file, cb) {
    const obj = JSON.parse(JSON.stringify(req.body))
    console.log('바디', obj)
    cb(
      null,
      __dirname + '../../../public/Data/genres_original/' + obj.category + '/'
    )
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}__${file.originalname}`)
  },
})

var uploadWithOriginalFilename = multer({ storage: storage }) // 3-2

var request = require('request')

//멘토찾기
router.get('/search', ctrl.process.search)
router.get('/audition_write', ctrl.output.audition_write)

//로그인
router.get('/', auth, ctrl.output.main)
router.get('/login', ctrl.output.login)
router.get('/register', ctrl.output.register)

//마이페이지
//라우터 따로 뺌 multer.js

//게시판

router.post('/write', ctrl.process.write)
// router.get('/write',ctrl.output.post2_insert)
// router.get('/postView',ctrl.output['postView/:idx'])

router.post('/write', ctrl.process.write)
router.get('/write', ctrl.output.post2_insert)
router.get('/postView/:idx', ctrl.output['postView/:idx'])
router.get('/post2', ctrl.output.post2)
router.post('/comment',ctrl.process.comment)

//메인페이지
router.get('/post', ctrl.output.post)
router.get('/music', ctrl.output.music)
router.get('/chat', ctrl.output.chat)
router.get('/myinfo', ctrl.output.myinfo)
//채팅
router.get('/chatting', ctrl.output.chatting)
router.get('/chat', ctrl.output.chat)
//오디션
router.get('/audition_star', ctrl.output.audition_star)
router.get('/audition', ctrl.output.audition)

//스토어
router.get('/store1', ctrl.output.store1)
router.get('/store2', ctrl.output.store2)
router.get('/store3', ctrl.output.store3)

//멘토멘티
router.get('/mento', ctrl.output.mento)
router.get('/mentoView', ctrl.output.mentoView)
router.get('/mentoView/:idx', ctrl.output['mentoView/:idx'])
router.get('/mento_info/:user_idx', ctrl.output['mento_info/:user_idx'])

//멘토마이페이지
router.get('/mento_info', ctrl.output.mento_info)
router.get('/mento_reviw', ctrl.output.mento_reviw)

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~오디오 테스트용~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
router.get('/record', ctrl.output.record)
router.get('/record2', ctrl.output.record2)

//AI보컬트레이닝
router.get('/music_list', ctrl.output.music_list)
router.get('/vocaltraining', ctrl.output.vocaltraining)
router.get('/vocalResult', ctrl.output.vocalResult)
router.get('/custom_matching', ctrl.output.custom_matching)
router.post('/custom_matching', ctrl.process.custom_matching)
router.get('/vocalloding', ctrl.output.vocalloding)
router.get('/vocalwave', ctrl.output.vocalwave)
router.get('/vocalgenre', ctrl.output.vocalgenre)

//로그인, 회원가입 값 받는 POST
router.post('/login', ctrl.process.login)
router.post('/register', ctrl.process.register)
router.post('/overlapCheck', ctrl.process.overlapCheck)

router.post(
  '/record/fileUpload',
  uploadWithOriginalFilename.single('file'),
  (req, res, next) => {
    const { name } = req.body
    console.log('body 데이터 : ', name)

    req.files.map((data) => {
      console.log('폼에 정의된 필드명 : ', data.fieldname)
      console.log('사용자가 업로드한 파일 명 : ', data.originalname)
      console.log('파일의 엔코딩 타입 : ', data.encoding)
      console.log('파일의 Mime 타입 : ', data.mimetype)
      console.log('파일이 저장된 폴더 : ', data.destination)
      console.log('destinatin에 저장된 파일 명 : ', data.filename)
      console.log('업로드된 파일의 전체 경로 ', data.path)
      console.log('파일의 바이트(byte 사이즈)', data.size)
    })
  }
)

//인공지능 분석을 위한 보컬파일
router.post(
  '/uploadFile',
  uploadWithOriginalFilename.single('video'),
  async (req, res, next) => {
    const {
      fieldname,
      originalname,
      encoding,
      mimetype,
      destination,
      filename,
      path,
      size,
    } = req.file
  
    const { category, m_idx, ori_image, music_name} = req.body

    //이미지
    var jsonData = {
      categoryName: category,
      fileName: filename,
    }
    //장르분석
    var jsonData2 = {
      categoryName: category,
      fileName: filename,
      c_code: Number(req.body.c_code),
    }
    // 사진 데이터 추출
    const resultImg = await axios.post('http://127.0.0.1:5000/features', jsonData,
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    )
    const AI_image = resultImg.data.image
    // 장르 분류
    const resultMsg = await axios.post('http://127.0.0.1:5000/predict', jsonData2,
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    )
    const msg = resultMsg.data.message;
    const predict_c_code = resultMsg.data.c_code;
    const predict_genre = resultMsg.data.predict_genre;

    var sql = 'INSERT INTO tbl_mp3(originalname, filename, mimetype, path, size, msg, m_idx, AI_image, predict_c_code, predict_genre) VALUES (?,?,?,?,?,?,?,?,?,?);'

    const { insertId } = await new Promise((resolve, reject) => {
      db.query(sql, [originalname, filename, mimetype, path, size, msg, m_idx, AI_image, predict_c_code, predict_genre], (err, rows, field) => {
        if (err) reject(`${err}`)
        resolve(rows)
      })
    })
    res.render('home/vocalwave', {image: AI_image, ori_image: ori_image, music_name: music_name, p_idx: insertId, m_idx: m_idx })

  }
)

router.post('/mento_like', (req, res) => {
  try {
    if (typeof req.body.mentoIdx === 'undefined') {
      throw new Error('올바르지 않은 접근입니다.')
    }
    const result = ctrl.process.mento_like({
      body: req.body,
      cookies: req.cookies,
    })
    res.send({
      result: true,
    })
  } catch (err) {
    res.send({
      result: false,
      message: err.message,
    })
  }
})
module.exports = router
