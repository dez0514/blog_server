var mysql = require('mysql');
// 引入mysql连接配置
var mysqlconfig = require('../config/mysql');
// 引入连接池配置
var poolextend = require('./poolextend');
// 使用连接池，提升性能
var pool = mysql.createPool(poolextend({}, mysqlconfig));
var sqlTool = {
    add: function(sql,vallist, res, next) {
        pool.getConnection(function(err, connection) {
            if(err) {
                res.json({
                    code: 1, 
                    message: err,
                });
                return
            }
            connection.query(sql, [...vallist], function(error, result) {
                if(err) {
                    res.json({
                        code: 1, 
                        message: error,
                    });
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
    // delete: function(req, res, next) {
    //     pool.getConnection(function(err, connection) {
    //         var id = +req.query.id;
    //         connection.query(sql.delete, id, function(err, result) {
    //             if (result.affectedRows > 0) {
    //                 result = 'delete';
    //             } else {
    //                 result = undefined;
    //             }
    //             json(res, result);
    //             connection.release();
    //         });
    //     });
    // },
    // update: function(req, res, next) {
    //     var param = req.body;
    //     if (param.name == null || param.age == null || param.id == null) {
    //         json(res, undefined);
    //         return;
    //     }
    //     pool.getConnection(function(err, connection) {
    //         connection.query(sql.update, [param.name, param.age, +param.id], function(err, result) {
    //             if (result.affectedRows > 0) {
    //                 result = 'update'
    //             } else {
    //                 result = undefined;
    //             }
    //             json(res, result);
    //             connection.release();
    //         });
    //     });
    // },
    queryById: function(sql,req, res, next) {
        var id = +req.query.id;
        pool.getConnection(function(err, connection) {
            if(err) {
                res.json({
                    code: 1, 
                    message: err,
                });
                return
            }
            connection.query(sql, id, function(error, result) {
                if(err) {
                    res.json({
                        code: 1, 
                        message: error,
                    });
                    return
                }
                if(result.length > 0) {
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
    queryAll: function(sql ,req, res, next) {
        pool.getConnection(function(err, connection) {
            if(err) {
                res.json({
                    code: 1, 
                    message: err,
                });
                return
            }
            connection.query(sql, function(error, result) {
                if(err) {
                    res.json({
                        code: 1, 
                        message: error,
                    });
                    return
                }
                res.json({
                    code: 0, 
                    message: '查询成功',
                    data: result
                });
                connection.release();
            });
        });
    }
};
module.exports = sqlTool;