const json = function (res, code, data, message, total=-1) {
  const response = {
    code: code,
    message: message
  }
  if(total > -1) {
    response.total = total
  }
  if(data) {
    if(Number(code) === 0) {
      response.data = data
    } else {
      response.error = data
    }
  }
  res.json({...response})
}
module.exports = json