module.exports = (req, res, next) => {
  console.log('setting cors....')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, PUT, POST, DELETE, HEAD, OPTIONS'
  )
  next()
}
