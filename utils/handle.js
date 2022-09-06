var mysql = require('mysql');
// 引入mysql连接配置
var mysqlconfig = require('../config/mysql');
// 引入连接池配置
var poolextend = require('./poolextend');
// 使用连接池，提升性能
var pool = mysql.createPool(poolextend({}, mysqlconfig));
// todo: 1.改成await写法 返回出去。
//       2.查完不一定就立马响应回去，可能还要查别的，要控制是否响应，最好结合todo1, 将响应放在调用的地方写。

var sqlTool = {
  add: function (sql, vallist, res, next) {
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({
          code: 1,
          message: err,
        });
        connection.release();
        return
      }
      connection.query(sql, [...vallist], function (error, result) {
        if (error) {
          console.log(error)
          res.json({
            code: 1,
            message: error,
          });
          connection.release();
          return
        }
        console.log(result)
        res.json({
          code: 0,
          message: '添加成功',
          data: result
        });
        // 释放连接 
        connection.release();
      });
    });
  },
  update: function (sql, vallist, res, next) {
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({
          code: 1,
          message: err,
        });
        connection.release();
        return
      }
      connection.query(sql, [...vallist], function (error, result) {
        if (error) {
          console.log(error)
          res.json({
            code: 1,
            message: error,
          });
          connection.release();
          return
        }
        res.json({
          code: 0,
          message: '编辑成功',
          data: result
        });
        connection.release();
      });
    });
  },
  delete: function (sql, id, res, next) {
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({
          code: 1,
          message: err,
        });
        connection.release();
        return
      }
      connection.query(sql, id, function (error, result) {
        if (err) {
          res.json({
            code: 1,
            message: error,
          });
          connection.release();
          return
        }
        res.json({
          code: 0,
          message: '删除成功',
          data: result
        });
        connection.release();
      });
    });
  },
  queryById: function (sql, id, res, next) {
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({
          code: 1,
          message: err,
        });
        connection.release();
        return
      }
      connection.query(sql, id, function (error, result) {
        if (err) {
          res.json({
            code: 1,
            message: error,
          });
          connection.release();
          return
        }
        if (result.length > 0) {
          res.json({
            code: 0,
            message: '查询成功',
            data: result[0]
          });
        } else {
          res.json({
            code: 0,
            message: '查询成功',
            data: {}
          });
        }
        connection.release();
      });
    });
  },
  queryAll: function (sql, valArr, req, res, next, isPage=false) {
    pool.getConnection(function (err, connection) {
      if (err) {
        res.json({
          code: 1,
          message: err,
        });
        connection.release();
        return
      }
      connection.query(sql, [...valArr], function (error, result) {
        if (err || !result) {
          res.json({
            code: 1,
            message: error,
          });
          connection.release();
          return
        }
        // console.log('result.length===', result.length)
        // console.log('result===', JSON.stringify(result))
        if(isPage) {
          // 分页时 result = [[{"COUNT(*)":3}],[...data]]
          const total = (result && result[0] && result[0][0] && (result[0][0]['COUNT(*)'] || result[0][0]['COUNT(1)'])) || 0
          const data = (result && result.length > 1) ? result[1] : []
          res.json({
            code: 0,
            message: '查询成功',
            data,
            total
          });
        } else {
          res.json({
            code: 0,
            message: '查询成功',
            data: result
          });
        }
        connection.release();
      });
    });
  }
};
module.exports = sqlTool;