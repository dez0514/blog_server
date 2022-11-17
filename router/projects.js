const express = require('express')
const router = express.Router()
const qs = require('qs')
const query = require('../utils/pool_async')
const json = require('../utils/response')
const dayjs = require('dayjs')
// 列表
router.get('/project_all_list', async function (req, res, next) {
  try {
    const sql = 'SELECT * FROM projects'
    const data = await query(sql, [])
    if (data.length > 0) {
      const ids = data.map(item => item.id)
      const sqlstr = `select t.*, r.project_id from companys t left join company_project r on t.id = r.company_id where r.project_id in (${ids});`
      const result = await query(sqlstr, [])
      data.forEach(item => {
        item.companyInfo = []
        result.forEach(inner => {
          if (inner && inner.project_id === item.id) {
            item.companyInfo.push({
              companyId: inner.id,
              name: inner.name,
              durings: inner.durings,
              sort: inner.sort
            })
          }
        })
      })
    }
    // console.log(data)
    json(res, 0, data, '查询成功!')
  } catch (err) {
    // console.log(err)
    json(res, 1, err, '查询失败!')
  }
});
// 分页
router.get('/project_list', async function (req, res, next) {
  try {
    let params = req.query;
    let { pageSize, pageNum } = params
    if (!pageSize) { pageSize = 10 }
    if (!pageNum) { pageNum = 1 }
    let start = (pageNum - 1) * pageSize
    let sql = `SELECT COUNT(*) FROM projects; SELECT * FROM projects limit ${start},${pageSize};`
    const result = await query(sql, [])
    const total = (result && result[0] && result[0][0] && (result[0][0]['COUNT(*)'] || result[0][0]['COUNT(1)'])) || 0
    const data = (result && result.length > 1) ? result[1] : []
    if (data.length > 0) {
      const ids = data.map(item => item.id)
      const sqlstr = `select t.*, r.project_id from companys t left join company_project r on t.id = r.company_id where r.project_id in (${ids});`
      const result = await query(sqlstr, [])
      data.forEach(item => {
        item.companyInfo = []
        result.forEach(inner => {
          if (inner && inner.project_id === item.id) {
            item.companyInfo.push({
              companyId: inner.id,
              name: inner.name,
              durings: inner.durings,
              sort: inner.sort
            })
          }
        })
      })
    }
    json(res, 0, data, '查询成功!', total)
  } catch (err) {
    json(res, 1, err, '查询失败!')
  }
});
router.post('/add_project', async function (req, res, next) {
  try {
    let params = req.body;
    const { name, intro, technology, details, companyId, id } = params
    const sort = params.sort || 0
    const status = params.status || 0
    let vallist = []
    let sql = ''
    if(id) { // 编辑
      const update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
      vallist = [name, intro, technology, details, sort, status, update_time]
      sql = `UPDATE projects SET name=?, intro=?, technology=?, details=?, sort=?, status=?,update_time=? WHERE id=?`
      const list = [...vallist, id]
      const result = await query(sql, list)
      if (result && result.affectedRows && result.affectedRows > 0) {
        // 这个id === 关联表中(project_id), 修改 project_id 对应的 company_id 
        // 一个项目 只对应一个 company, 一个 company 对应多个项目（即关联表中：company_id 可重复，project_id不会重复）
        const linkSql = `UPDATE company_project SET company_id=? WHERE project_id=?`
        const linkArr = [companyId, id]
        const linkResult = await query(linkSql, linkArr)
        if (linkResult && linkResult.affectedRows && linkResult.affectedRows > 0) {
          json(res, 0, null, '编辑成功!')
        } else {
          json(res, 1, linkResult, '编辑失败!')
        }
      } else {
        json(res, 1, result, '编辑失败!')
      }
    } else {
      vallist = [name, intro, technology, details, sort, status]
      sql = 'INSERT INTO projects(name, intro, technology, details, sort, status) VALUES(?,?,?,?,?,?)'
      const result = await query(sql, vallist)
      if (result && result.affectedRows && result.affectedRows > 0) {
        // 插入关联表
        const linkSql = `INSERT INTO company_project(company_id, project_id) VALUES(?,?)`
        const projectId = result.insertId
        const linkArr = [companyId, projectId]
        const linkResult = await query(linkSql, linkArr)
        if (linkResult && linkResult.affectedRows && linkResult.affectedRows > 0) {
          json(res, 0, null, '新增成功!')
        } else {
          json(res, 1, linkResult, '新增失败!')
        }
      } else {
        json(res, 1, result, '新增失败!')
      }
    }
  } catch(err) {
    json(res, 1, err, '操作失败!')
  }
});

router.post('/delete_project', async function (req, res, next) {
  try {
    const id = req.body.id;
    const sql = `DELETE FROM projects WHERE id=?`
    const dataResult = await query(sql, id)
    if (dataResult && dataResult.affectedRows && dataResult.affectedRows === 0) {
      json(res, 1, dataResult, '删除失败!')
      return
    }
    const delSql = `DELETE FROM company_project WHERE project_id=?`
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