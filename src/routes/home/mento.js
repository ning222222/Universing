//로그인, 회원가입 컨트롤러 기능
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'carpeDM'
const db = require('../../config/db')
const express = require('express')
const router = express.Router()
//멀터
const multer = require("multer");
const sharp = require("sharp");
const path = require('path');
const fs = require('fs');
//멀터


router.get('/',function(req,res){
    res.render('home/mento_post.ejs');
  });
  const upload = multer({
    storage: multer.diskStorage({	// 파일 저장 경로
      destination(req, file, cb) {
        cb(null, "./src/public/uploadimages/");
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);	// 파일 확장자
        const timestamp = new Date().getTime().valueOf();	// 현재 시간
        // 새 파일(기존파일명 + 시간 + 확장자)
        const filename = path.basename(file.originalname, ext) + timestamp + ext;
        cb(null, filename);
      },
    }),
  });
  router.post("/upload", upload.single("image"), (req, res) => {
    res.json({ filename: `${req.file.filename}` });
  });
  router.post("/upload", upload.single("image"), (req, res) => {
    try {
      sharp(req.file.path)  // 압축이미지경로
        .resize({ width: 600 }) // 비율을 유지하며 가로 크기 줄이기
        .withMetadata()	// 이미지의 exif데이터 유지
        .toBuffer((err, buffer) => {
          if (err) throw err;
          // 압축된 파일 새로 덮어씌움
          fs.writeFile(req.file.path, buffer, (err) => {
            if (err) throw err;
          });
        });
    } catch (err) {
      console.log(err);
    }
    res.json({ filename: `${req.file.filename}` });
  });

router.post('/', upload.single("image"),function (req, res,next)  {
    var userid = req.cookies.token;
    var decoded = jwt.verify(userid,SECRET_KEY)
    var user_idx = decoded.user_idx;
    var nickname = decoded.nickname;
    if(!userid) 
        res.redirect('/login');
    console.log('req.body',req.body);
    console.log('req.body',decoded.user_idx);
      var title = req.body.title;
      var content = req.body.content;
      var address = req.body.address;
      var madress = req.body.address_detail;
      var price = req.body.price;
      var img = `/uploadimages/${req.file.filename}`
      var video = req.body.video;
      var sql = "insert into mento(user_idx,nickname,title,content,img,address,madress,video,price,regdate,udate) values(?,?,?,?,?,?,?,?,?,now(),now())"
      var datas = [user_idx,nickname,title,content,img,address,madress,video,price];
      db.query(sql,datas,function(err,rows,fields){
          if(err) console.error("err:" +err);
          res.redirect('mento');        
      });
  });

  // /** 좋아요 생성 */
  // router.post("/like/:idx", async (req,res) => {
  //   const {token} = req.cookies
  //   const {idx : mento_idx} = req.params
  //   const {user_idx} = jwt.verify(token,SECRET_KEY)
  //   if(checkLiked(user_idx, mento_idx)) res.json({result : false, message : "Like가 이미 존재함."})
  //   const sql = "INSERT INTO mento_like(user_idx, memto_idx) values(?,?)"
  //   db.query(sql, [user_idx, mento_idx], (err, doc) => {
  //     if(err) console.log(err)
  //     res.json({result : true})
  //   })
  // })

  // router.post("/unlike/:id", async (req,res) => {
  //   const {token} = req.cookies
  //   const {idx : mento_idx} = req.params
  //   const {user_idx} = jwt.verify(token,SECRET_KEY)
  //   if(!checkLiked(user_idx, mento_idx)) res.json({result : false, message : "Not Found."})
  //   const sql = "DELETE FROM mento_like WHERE user_idx=? && mento_idx = ?"
  //   db.query(sql, [user_idx, mento_idx], (err, rows) => {
  //     if(err) console.log(err)
  //     res.json(true)
  //   })
  // })

  //  /** 좋아요 있는 지 확인 */
  // const checkLiked = async (user_idx, mento_idx) => {
  //   const sql = "SELECT * FROM mento_like where user_idx=? && mento_idx = ?"
  //   db.query(sql, [user_idx, mento_idx], (err, rows) => {
  //     if(err) console.log(err)
  //     return rows ? true : false
  //   })
  // }

  module.exports = router