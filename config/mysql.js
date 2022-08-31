const mysql = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'blog',
  timezone: 'SYSTEM',
  multipleStatements: true // 一次查询多条sql
};
module.exports = mysql;
