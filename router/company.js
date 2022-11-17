const express = require('express')
const router = express.Router()
const qs = require('qs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
const dayjs = require('dayjs')
// 公司经历列表
router.get('/company_list', async function (req, res, next) {
  try {
    const sql = 'SELECT * FROM companys'
    const data = await query(sql, [])
    // console.log(data)
    json(res, 0, data, '查询成功!')
  } catch (err) {
    // console.log(err)
    json(res, 1, err, '查询失败!')
  }
});
// 新增与编辑
router.post('/add_company', async function (req, res, next) {
  try {
    let params = req.body;
    const { name, durings, id } = params
    const sort = params.sort || 0 // 没有就 0
    const status = params.status || 0
    let vallist = []
    let sql = ''
    if(id) { // 编辑
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      vallist = [name, durings, sort, status, update_time]
      sql = `UPDATE companys SET name=?, durings=?, sort=?, status=?,update_time=? WHERE id=?`
      const list = [...vallist, id]
      const result = await query(sql, list)
      if (result && result.affectedRows && result.affectedRows > 0) {
        json(res, 0, null, '编辑成功!')
      } else {
        json(res, 1, result, '编辑失败!')
      }
    } else {
      vallist = [name, durings, sort, status]
      sql = 'INSERT INTO companys(name, durings, sort, status) VALUES(?,?,?,?)'
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
// 批量新增
router.post('/add_company_list', async function (req, res, next) {
  try {
    const params = req.body;
    const { companys } = qs.parse(params)
    if(!Array.isArray(companys)) {
      json(res, 1, null, '参数错误!')
      return
    }
    let vq = ''
    let temp = []
    companys.forEach((item, index) => {
      const { name, durings } = item
      const sort = item.sort || 0
      const status = item.status || 0
      const vallist = [name, durings, sort, status]
      vq = vq + ((index ===  companys.length - 1) ? '(?,?,?,?)' : '(?,?,?,?),')
      temp = temp.concat(vallist)
    })
    let sql = `INSERT INTO companys(name, durings, sort, status) VALUES${vq};`
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

router.post('/delete_company', async function (req, res, next) {
  try {
    const id = req.body.id;
    const sql = `DELETE FROM companys WHERE id=?`
    const dataResult = await query(sql, id)
    if (dataResult && dataResult.affectedRows && dataResult.affectedRows === 0) {
      json(res, 1, dataResult, '删除失败!')
      return
    }
    const delSql = `DELETE FROM company_project WHERE company_id=?`
    // 删除关联表里 对应的 company_id 数据
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