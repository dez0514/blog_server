const json = function (res, code, data, message) {
  const response = {
    code: code,
    message: message
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