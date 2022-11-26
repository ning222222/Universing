const jwt = require('jsonwebtoken')
const SECRET_KEY = 'carpeDM'

exports.auth = (req, res, next) => {
  console.log(req.cookies)
  const { token } = req.cookies
  if (!token) {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' })
    res.write("<script>alert('로그인이 필요한 페이지 입니다.')</script>")
    res.write('<script>window.location="/login"</script>')
    // return res.status(401).json("로그인이 필요한 페이지 입니다.");
  } else {
    jwt.verify(token, SECRET_KEY, async (error, decoded) => {
      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' })
        res.write("<script>alert('로그인이 필요한 페이지 입니다.')</script>")
        res.write('<script>window.location="/login"</script>')
        // return res.status(401).json('Authentication Error')
      }
      //   const user = await userModel.findByUserId(decoded.id);
      //   if (!user) {
      //     return res.status(401).json(AUTH_ERROR);
      //   }
      //req.userId = user.id; // req.customData
      next()
    })
  }
}
