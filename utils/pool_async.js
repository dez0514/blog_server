const mysql = require('mysql');
// 引入mysql连接配置
const mysqlconfig = require('../config/mysql');
// 引入连接池配置
const poolextend = require('./poolextend');
// 使用连接池，提升性能
const pool = mysql.createPool(poolextend({}, mysqlconfig));

const query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, function (error, result) {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
          connection.release();
        })
      }
    })
  })
}

module.exports = query