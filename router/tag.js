const express = require('express')
const router = express.Router()
const qs = require('qs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
// 标签列表
router.get('/tag_all_list', async function (req, res, next) {
  try {
    const sql = 'SELECT * FROM tags'
    const data = await query(sql, [])
    // console.log(data)
    json(res, 0, data, '查询成功!')
  } catch (err) {
    // console.log(err)
    json(res, 1, err, '查询失败!')
  }
});
// 分页
router.get('/tag_list', async function (req, res, next) {
  try {
    let params = req.query;
    let { pageSize, pageNum } = params
    if (!pageSize) { pageSize = 10 }
    if (!pageNum) { pageNum = 1 }
    let start = (pageNum - 1) * pageSize
    let sql = `SELECT COUNT(*) FROM tags; SELECT * FROM tags limit ${start},${pageSize};`
    const result = await query(sql, [])
    const total = (result && result[0] && result[0][0] && (result[0][0]['COUNT(*)'] || result[0][0]['COUNT(1)'])) || 0
    const data = (result && result.length > 1) ? result[1] : []
    json(res, 0, data, '查询成功!', total)
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
router.post('/add_tag', async function (req, res, next) {
  try {
    let params = req.body;
    const { name, color, icon, id } = params
    const vallist = [name, color, icon]
    let sql = ''
    if(id) { // 编辑
      sql = `UPDATE tags SET name=?, color=?, icon=? WHERE id=?`
      const list = [...vallist, id]
      const result = await query(sql, list)
      if (result && result.affectedRows && result.affectedRows > 0) {
        json(res, 0, null, '编辑成功!')
      } else {
        json(res, 1, result, '编辑失败!')
      }
    } else {
      sql = 'INSERT INTO tags(name, color, icon) VALUES(?,?,?)'
      const result = await query(sql, vallist)
      if (result && result.affectedRows && result.affectedRows > 0) {
        json(res, 0, null, '新增成功!')
      } else {
        json(res, 1, result, '新增失败!')
      }
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});
// 批量
router.post('/add_taglist', async function (req, res, next) {
  try {
    const params = req.body;
    const { taglist } = qs.parse(params)
    // console.log('taglist==', taglist)
    if(!Array.isArray(taglist)) {
      json(res, 1, null, '参数错误!')
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
    const result = await query(sql, temp)
    if (result && result.affectedRows && result.affectedRows > 0) {
      json(res, 0, null, '新增成功!')
    } else {
      json(res, 1, result, '新增失败!')
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});

router.post('/delete_tag', async function (req, res, next) {
  try {
    const id = req.body.id;
    const sql = `DELETE FROM tags WHERE id=?`
    const dataResult = await query(sql, id)
    if (dataResult && dataResult.affectedRows && dataResult.affectedRows === 0) {
      json(res, 1, dataResult, '删除失败!')
      return
    }
    const delSql = `DELETE FROM article_tag WHERE tag_id=?`
    // 删除关联表里 对应的 tag_id 数据
    const result = await query(delSql, id)
    if (result && result.affectedRows && result.affectedRows > 0) {
      json(res, 0, null, '删除成功!')
    } else {
      json(res, 1, result, '删除失败!')
    }
  } catch(err) {
    json(res, 1, err, '删除失败!')
  }
});

module.exports = router;