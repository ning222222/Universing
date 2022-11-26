'use strict'

//모듈
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv')
const morgan = require('morgan')

const app = express()
dotenv.config()

//라우팅
const home = require('./src/routes/home')
const multers = require('./src/routes/home/multer')
const mento = require('./src/routes/home/mento')
const audition_video = require('./src/routes/home/auditionvideo')
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, 'access.log'),
//   { flags: 'a' }
// )

//앱세팅
app.set('views', './src/views')
app.set('view engine', 'ejs')
app.set('video', __dirname + '/public/video');
app.use(express.static(`${__dirname}/src/public`))
app.use('/uploadimages',express.static('uploadimages'));
app.use('/node_modules', express.static('node_modules'));
app.use(bodyParser.json())
//URL을 통해 전달되는 데이터에 한글, 공백 등과 같은 문자가 포함될 경우 제대로 인식되지 않는 문제 해결
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
// app.use(morgan('dev'), { stream: 스트림 })
app.use('/mento_insert',mento)
app.use('/mypage_insert',multers)
app.use('/audition_insert',audition_video)
app.use('/', home) //use -> 미들웨어를 등록해주는 메서드

module.exports = app
