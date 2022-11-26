//로그인, 회원가입 컨트롤러 기능
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'carpeDM'
const db = require('../../config/db')
const express = require('express')
const router = express.Router()
const { spawn } = require('child_process')
const iconv = require('iconv-lite')

const output = {
  //메인페이지
  main: async (req, res) => {
    var userid = req.cookies.token
    let decoded = jwt.verify(userid, SECRET_KEY)
    let user_idx = decoded.user_idx
    let user_nick = decoded.nickname
    const sql = 'SELECT nickname from users where user_idx = ?;'
    const sql2 = 'SELECT * from music_list'
    const sql3 = 'select * from mento'
    db.query(sql, [user_idx, user_nick], (err, dataOne) => {
      if (err) console.error(err)
      db.query(sql2, (err, dataTwo) => {
        if (err) console.error(err)
        db.query(sql3, (err, dataThree) => {
          if (err) console.error(err)
          const rows = [...dataOne, ...dataTwo]
          const rows2 = [...dataThree]
          res.render('home/main', {
            title: '글 상세',
            rows: rows,
            rows2: rows2,
          })
        })
      })
    })
  },
  //멘토찾기
  search: (req, res) => {
    res.render('home/search')
  },

  //로그인 및 회원가입
  login: (req, res) => {
    res.render('home/login')
  },
  register: (req, res) => {
    res.render('home/register')
  },
  logout: (req, res) => {
    res.render('home/logout')
  },
  //마이페이지 및 게시글작성
  post: (req, res) => {
    res.render('home/post')
  },

  post2_insert: (req, res) => {
    //기능
    res.render('home/postWrite.ejs')
  },

  post: function (req, res) {
    var sql =
      "SELECT board.*,users.image from board join users on users.user_idx = board.userid where b_type='자유'"
    db.query(sql, function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      else res.render('home/post', { rows: rows })
    })
  },

  post2: function (req, res) {
    var sql =
      "SELECT board.*,users.image from board join users on users.user_idx = board.userid where b_type='후기'"
    db.query(sql, function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      else res.render('home/post', { rows: rows })
    })
  },

  music: (req, res) => {
    res.render('home/music')
  },

  myinfo: (req, res) => {
    res.render('home/myinfo')
  },

  myinfo: (req, res) => {
    var userid = req.cookies.token
    let decoded = jwt.verify(userid, SECRET_KEY)
    let user_idx = decoded.user_idx
    const sql =
      'SELECT  users.user_idx , users.nickname, users.content, users.image, mento.title,mento.img,mento.m_idx from users join mento on users.user_idx = mento.user_idx where users.user_idx=? '
    db.query(sql, [user_idx], (err, rows) => {
      if (err) console.log(err)
      console.log(rows)
      var cnt = rows.length
      res.render('home/myinfo', { title: '글 상세', rows: rows ,cnt : cnt})
    })
    // var sql = "SELECT user_idx, nickname, content, image from users where user_idx=? union all select idx, title, content, nickname from board where userid=? "
    // db.query(sql, [user_idx,user_idx], function (err, rows) {
    //   console.log(rows)
    //   if (err) console.error(err)
    //   res.render('home/myinfo', { title: '글 상세', rows: rows[0] })
    // })
  },

  postView: (req, res) => {
    //기능
    res.render('home/postView')
  },
  audition_write: (req, res) => {
    res.render('home/audition_write')
  },
  'postView/:idx': function (req, res) {
    var idx = req.params.idx

    var sql ='SELECT board.idx, board.title, board.content,board.view, board.nickname, users.image from board join users on users.user_idx = board.userid where board.idx= ? '
    var sql2 = "select content, nickname, date_format(regdate,'%Y-%m-%d %H:%i:%s') as date from comment where board_idx = ?"
    db.query(sql,[idx], (err, dataOne) => {
      if (err) console.error(err)
      db.query(sql2,[idx], (err, dataTwo) => {
        if (err) console.error(err)
        const rows = [...dataOne]
        const rows2 =[...dataTwo]
        console.log(dataTwo)
        res.render('home/postView', { rows: rows , rows2 : rows2 })
      })
    })
  },
  
  //오디션
  audition_star: (req, res) => {
    res.render('home/audition_star')
  },
  audition: (req, res) => {
    sql = 'select * from tbl_univstar '
    db.query(sql, function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      console.log(rows)
      res.render('home/audition', { rows: rows })
    })
  },
  music_list: (req, res) => {
    sql = 'SELECT * FROM music_list'
    db.query(sql, function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      console.log(rows)
      res.render('home/music_list', { rows: rows })
    })
  },

  vocaltraining: (req, res) => {
    let { m_idx } = req.query
    // console.log(m_idx);
    sql = 'SELECT * FROM music_list WHERE m_idx = ? '
    db.query(sql, [m_idx], function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      console.log(rows)
      res.render('home/vocaltraining', { rows: rows[0] })
    })
    
  },
  //인공지능장르추천
  vocalResult: (req, res) => {
    console.log(req.query.p_idx);
    var sql =  `SELECT *, (select ment from mentList where mentList.c_code = A.predict_c_code order by rand() limit 1) as ment
     from tbl_mp3 A join music_list B on A.m_idx = B.m_idx where A.p_idx= ${req.query.p_idx} and B.m_idx=${req.query.m_idx}; `

    var sql2 = `select * from music_list A join tbl_mp3 B on A.c_code = B.predict_c_code
     where B.p_idx = ${req.query.p_idx} order by rand() limit 2`

    db.query(sql, (err, dataOne) => {
      if (err) console.error(err)
      db.query(sql2, (err, dataTwo) => {
        if (err) console.error(err)
        const rows = [...dataOne]
        const rows2 =[...dataTwo]
        console.log(dataTwo)
        res.render('home/vocalResult', { rows: rows , rows2 : rows2 })
      })
    })
  },
  
  custom_matching: (req, res) => {
      res.render('home/custom_matching')

  },
  vocalloding: (req, res) => {
    res.render('home/vocalloding')
  },
  record: (req, res) => {
    res.render('home/record')
  },
  record2: (req, res) => {
    res.render('home/record2')
  },
  //스토어
  store1: (req, res) => {
    res.render('home/store1')
  },
  store2: (req, res) => {
    res.render('home/store2')
  },
  store3: (req, res) => {
    res.render('home/store3')
  },
  //멘토
  mento: function (req, res) {
    var sql = 'SELECT * FROM mento'
    db.query(sql, function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      else res.render('home/mento', { rows: rows })
    })
  },
  mentoView: (req, res) => {
    res.render('home/mentoView')
  },
  mento_post: (req, res) => {
    res.render('home/mento_post')
  },
  mento_insert: (req, res) => {
    res.render('home/mento_post')
  },
  //멘토 정보
  'mento_info/:user_idx': function (req, res) {
    var user_idx = req.params.user_idx
    var sql = 'SELECT users.user_idx , users.nickname, users.content, users.image, mento.title,mento.img,mento.m_idx from users join mento on users.user_idx = mento.user_idx where users.user_idx=? '
    // "UPDATE board SET view = view + 1 WHERE idx = ?; " ;
    // var sql2 = "UPDATE board SET view = view + 1 WHERE idx = ?;"
    db.query(sql, [user_idx], function (err, rows) {
      if (err) console.error(err)
      res.render('home/mento_info', { title: '글 상세', rows: rows })
    })
  },
  mento_info: (req, res) => {
    res.render('home/mento_info')
  },
  //멘토 보기
  'mentoView/:idx': function (req, res) {
    var idx = req.params.idx
    var sql =
      "SELECT user_idx,nickname, title, content,img,address,madress,video,price,likes,date_format(regdate,'%Y-%m-%d %H:%i:%s')  from mento where m_idx=?; "
    // "UPDATE board SET view = view + 1 WHERE idx = ?; " ;regdate
    // var sql2 = "UPDATE board SET view = view + 1 WHERE idx = ?;"
    db.query(sql, [idx], function (err, rows) {
      if (err) console.error(err)
      res.render('home/mentoView', {
        title: '글 상세',
        rows: rows[0],
        mento_idx: idx,
      })
    })
  },
  mento_reviw: (req, res) => {
    res.render('home/mento_reviw')
  },
  mento_post: (req, res) => {
    res.render('home/mento_post')
  },
  //채팅
  chatting: (req, res) => {
    res.render('home/chatting')
  },
  chat: (req, res) => {
    var userid = req.cookies.token
    let decoded = jwt.verify(userid, SECRET_KEY)
    let user_idx = decoded.user_idx
    const sql =
      'SELECT nickname from users where user_idx=? '
    db.query(sql, [user_idx], (err, rows) => {
      if (err) console.log(err)
      console.log(rows)
      res.render('home/chat', { title: '채팅 상세', rows: rows[0] })
    })
  },
  //테스트중
  test: (req, res) => {
    res.render('home/test')
  },

  //wav
  wav: (req, res) => {
    res.render('home/confirmation')
  },
  //보컬트레이닝
  vocalwave: (req, res) => {
    res.render('home/vocalwave')
  },
  vocalgenre: (req, res) => {
    res.render('home/vocalgenre')
  },

  python: async function (req, res) {
    const processStream = spawn('bash') // bash를 실행시킬 stream 선언
    processStream.stdin.write('python test.py') // 파이썬 실행
    processStream.stdin.end()
    let result = ''
    for await (const data of processStream.stdout) {
      result += iconv.decode(data, 'euc-kr')
    }
    res.render('home/test', {
      python_result: result,
    })
  },
}
const process = {
  //로그인
  login: async (req, res) => {
    const user = new User(req.body)
    const response = await user.login()
    //받은 요청의 id와 password로 DB에서 프로필사진, 닉네임 등 로그인 정보를 가져온다.
    console.log(response)
    //jwt.sign(payload, secretOrPrivateKey, [options, callback])
    if(!response.success){
      return res.status(403).json({
      success: false,
      code: 403,
      message: response.msg,
    })

    }
    const token = jwt.sign(
      {
        type: 'JWT',
        email: response.email,
        user_idx: response.user_idx,
        nickname: response.nickname,
      },
      SECRET_KEY,
      {
        expiresIn: '24h',
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
  //.json({ loginSuccess: true, userId: user._id })

  //회원가입
  register: async (req, res) => {
    const user = new User(req.body)
    const response = await user.register()

    return res.json(response)
  },

  //중복확인
  overlapCheck: async (req, res) => {
    const user = new User(req.body)
    // console.log(req.body.checkType)
    const response = await user.overlapCheck(req.body.checkType)
    return res.json(response)
  },

  //게시글
  write: function (req, res, next) {
    var userid = req.cookies.token
    let decoded = jwt.verify(userid, SECRET_KEY)
    let user_idx = decoded.user_idx
    let user_nick = decoded.nickname
    if (userid == 0) return res.render('/login')
    console.log('req.body', req.body)
    console.log('req.body', decoded.user_idx)
    var type = req.body.showValue
    var title = req.body.title
    var content = req.body.content

    var sql =
      "insert into board(userid,title,content,nickname,b_type,regdate) values(?,?,?,?,'자유',now())"
    var datas = [user_idx, title, content, user_nick, type]
    db.query(sql, datas, function (err, rows, fields) {
      if (err) console.error('err:' + err)
      res.redirect('post')
    })
  },
  //댓글
  comment: function (req, res, next) {
    var idx = req.body.idx
    var userid = req.cookies.token
    let decoded = jwt.verify(userid, SECRET_KEY)
    let user_idx = decoded.user_idx
    let user_nick = decoded.nickname
    if (userid == 0) return res.render('/login')
    var content = req.body.content
    console.log('req.body', req.body.idx)
    console.log('req.body', decoded.user_idx)
    var sql =
      "insert into comment(nickname,user_idx,board_idx,content,regdate) values(?,?,?,?,now())"
    var datas = [user_nick, user_idx, idx,content]
    db.query(sql, datas, function (err, rows, fields) {
      if (err) console.error('err:' + err)
      res.redirect('postView:/idx')
    })
  },
  //검색기능
  search: (req, res) => {
    //검색어 가져오기
    search = req.query.search
    //이스케이프 문제로 sql문 db.escape 사용
    var sql =
      'SELECT m_idx, title, content, img FROM mento WHERE title LIKE ' +
      db.escape('%' + search + '%')
    db.query(sql, [search], function (err, rows) {
      if (err) console.error(err)
      //rows로 프론트단에 뿌려줌
      res.render('home/search', { title: '글 상세', rows: rows })
    })
  },
  custom_matching: (req, res) => {
    var c_code = req.body.test
    console.log(c_code)
    var sql = `select mento.* from mento join tbl_mp3 on mento.category = tbl_mp3.predict_genre where mento.category=? `
    db.query(sql,[c_code], function (err, rows, fields) {
      if (err) console.log('query is not excuted. select fail...\n' + err)
      console.log(rows)
      res.render('home/custom_matching', { rows: rows })
    })
  },
  mento_like: function ({ body, cookies }) {
    const { mentoIdx } = body
    var userid = cookies.token
    let decoded = jwt.verify(userid, SECRET_KEY)
    const userIdx = decoded.user_idx
    let result
    // 예외처리
    if (typeof mentoIdx === 'undefined' || typeof userIdx === 'undefined') {
      throw new Error('올바르지 않은 접근입니다.')
    }

    const query =
      'SELECT * FROM mento_like where mento_idx = ? and user_idx = ?'
    const data = [mentoIdx, userIdx]
    db.query(query, data, (err, rows, fields) => {
      const flag = 'cancel'
      if (err) {
        console.error('err:' + err)
        throw new Error('예기치 않은 오류가 발생하였습니다.')
      }
      // 좋아요가 이미 있을경우 좋아요 취소
      if (rows.length > 0) {
        const delQuery = 'DELETE FROM mento_like where idx = ?'
        const delData = [rows[0].idx]
        db.query(delQuery, delData, (err) => {
          if (err) {
            console.error('err:' + err)
            throw new Error('좋아요 취소에 실패하였습니다.')
          }
        })

        const countQuery = 'UPDATE mento SET likes = likes - 1 WHERE m_idx = ?'
        const countData = [mentoIdx]
        // 좋아요 +1
        db.query(countQuery, countData, (err) => {
          if (err) console.error('err:' + err)
        })
      } else {
        // 좋아요가 없을경우 좋아요 처리
        const flag = 'cancel'
        const likeQuery =
          'INSERT INTO mento_like set mento_idx = ?, user_idx = ?'
        const likeData = [mentoIdx, userIdx]
        db.query(likeQuery, likeData, (err, rows) => {
          if (err) {
            console.error('err:' + err)
            throw new Error('좋아요에 실패하였습니다.')
          }
        })
        const countQuery = 'UPDATE mento SET likes = likes + 1 WHERE m_idx = ?'
        const countData = [mentoIdx]
        // 좋아요 +1
        db.query(countQuery, countData, (err) => {
          if (err) console.error('err:' + err)
        })
      }
    })
    return true
  },

  //인공지능 img 가져오기
  getWaveImage: async function(w_idx) {
    const sql = 'SELECT * FROM tbl_wave_img WHERE idx = ?'
    const data = [w_idx]
    const result = await new Promise((resolve, reject) => {
      db.query(sql, data, (err, rows) => {
          if (err) console.error('err:' + err)
          resolve(rows)
      })
    })
    return result
  },
  getWaveMsg: async function(w_idx2) {
  const sql = 'SELECT * FROM tbl_wave_img WHERE idx = ?'
  const data = [w_idx2]
  const result = await new Promise((resolve, reject) => {
    db.query(sql, data, (err, rows) => {
        if (err) console.error('err:' + err)
        resolve(rows)
    })
  })
  return result
},
}

module.exports = {
  output,
  process,
}
