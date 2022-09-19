const express = require('express')
const router = express.Router()
const sqlTool = require('../utils/handle')
const qs = require('qs')
const tokenjs = require('../utils/token')
// 标签列表
router.get('/tag_all_list', function (req, res, next) {
  // console.log(req.headers.authorization)
  const isTokenValid = tokenjs.checkToken(req.headers.authorization)
  console.log('isTokenValid==', isTokenValid)
  let sql = 'SELECT * FROM tags'
  sqlTool.queryAll(sql, [], req, res, next);
});
// 分页
router.get('/tag_list', function (req, res, next) {
  let params = req.query;
  let { pageSize, pageNum } = params
  if (!pageSize) { pageSize = 10 }
  if (!pageNum) { pageNum = 1 }
  let start = (pageNum - 1) * pageSize
  let sql = `SELECT COUNT(*) FROM tags; SELECT * FROM tags limit ${start},${pageSize};`
  sqlTool.queryAll(sql, [], req, res, next, true);
});
router.post('/add_tag', function (req, res, next) {
  let params = req.body;
  const { name, color, icon, id } = params
  const vallist = [name, color, icon]
  let sql = ''
  if(id) { // 编辑
    sql = `UPDATE tags SET name=?, color=?, icon=? WHERE id=${id}`
    sqlTool.update(sql, vallist, res, next);
  } else {
    sql = 'INSERT INTO tags(name, color, icon) VALUES(?,?,?)'
    sqlTool.add(sql, vallist, res, next);
  }
});
// 批量
router.post('/add_taglist', function (req, res, next) {
  const params = req.body;
  const { taglist } = qs.parse(params)
  // console.log('taglist==', taglist)
  if(!Array.isArray(taglist)) {
    res.json({
      code: 1,
      message: '参数错误!'
    })
    return
  }
  let vq = ''
  let temp = []
  taglist.forEach((item, index) => {
    const { name, color, icon } = item
    const vallist = [name, color, icon]
    vq = vq + ((index ===  taglist.length - 1) ? '(?,?,?)' : '(?,?,?),')
    temp = temp.concat(vallist)
  })
  let sql = `INSERT INTO tags(name, color, icon) VALUES ${vq}`
  sqlTool.add(sql, temp, res, next);
});
router.post('/delete_tag', function (req, res, next) {
  const id = req.body.id;
  const sql =  `DELETE FROM tags WHERE id=?`
  sqlTool.delete(sql, id, res, next);
});

module.exports = router;