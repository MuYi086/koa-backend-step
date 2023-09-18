const mysql = require('mysql2')
const {
  dbName,
  host,
  port,
  user,
  password
} = require('../config/index').database
const pool = mysql.createPool({
  host: host,
  port: port,
  user: user,
  password: password,
  database: dbName
})
const query = function (sql) {
  return new Promise((resolve, reject) => {
    pool.execute(sql, (err, results) => {
      if (err) reject(err)
      resolve(results)
    })
  })
}
const db = {
  query
}
module.exports = db