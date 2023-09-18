require('babel-register')
const Koa =  require('koa')
const https = require('https')
const fs = require('fs')
const path = require('path')
const { koaBody } = require('koa-body')
const router = require('./server/routers/index')
const swaggerRouter = require('./server/routers/swaggerRouter')
const errorHandler = require('./server/middlewares/errorHandler')
const koaJwt = require('koa-jwt')
const cors = require('koa2-cors')
const koaStatic = require('koa-static')
const sslify = require('koa-sslify').default
const Config = require('./server/config/index')
const app = new Koa()


const sslOptions = {
  key: fs.readFileSync('./server/ssl/private_key.pem'), // 私钥
  cert: fs.readFileSync('./server/ssl/ca-cert.pem') // 证书
}
app
.use(
  cors()
  // cors({
  //   origin: function(ctx) { // 设置允许来自指定域名请求
  //     const whiteList = ['https://127.0.0.1:8089'] // 可跨域白名单
  //     let url = ctx.header.referer.substr(0, ctx.header.referer.length - 1)
  //     if (whiteList.includes(url)) {
  //       return url // 注意，这里域名末尾不能带/，否则不成功，所以在之前我把/通过substr干掉了
  //     }
  //     return 'https://localhost:3001' // 默认允许本地请求3000端口可跨域
  //   },
  //   maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
  //   credentials: true, // 是否允许发送Cookie
  //   allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 设置所允许的HTTP请求方法
  //   allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 设置服务器支持的所有头信息字段
  //   exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] // 设置获取其他自定义字段
  // })
)
.use(sslify())
.use(errorHandler)
.use(koaStatic(Config.staticPath))
.use(koaBody({
  multipart: true,
  strict: false,
  parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'], // parse GET, HEAD, DELETE requests
  formidable: {
    uploadDir: Config.uploadDir, // 设置文件缓存文件夹
    maxFileSize: 1024 * 1024 * 10 * 1024
  },
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}))
.use(koaJwt({
  secret: Config.jwtConfig.secret
}).unless({
  // path: [/^\/api\/register/, /^\/api\/login/, /^\/api\/user/]
  path: [/^\/api\/user\/register/, /^\/api\/user\/login/, /^\/api\/file\/upload/, /^\/swagger/]
}))
.use(router.routes())
.use(router.allowedMethods())
.use(swaggerRouter.routes())
.use(swaggerRouter.allowedMethods())

const httpsServer = https.createServer(sslOptions, app.callback())
httpsServer.listen(3001, () => {
  console.log(httpsServer, '-------------------------httpsServer----------------------')
  console.log('server running success at 3001')
})