// node-schedule文档: https://github.com/node-schedule/node-schedule
const schedule = require('node-schedule')
function scheduleInit () {
  // 关闭所有定时任务
  schedule.gracefulShutdown()
  return schedule
}

// example
// const scheduleInit = require('./server/utils/Schedule')
// const schedule = scheduleInit()
// function schuduleCancel () {
//   let counter = 1
//   const j = schedule.scheduleJob('* * * * * *', function(){
//     console.log('定时器触发次数：' + counter)
//     counter++
//   })
//   setTimeout(() => {
//     console.log('定时器取消')
//     j.cancel()
//   }, 5000)
// }
// schuduleCancel()
module.exports = scheduleInit