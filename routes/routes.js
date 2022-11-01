const router = require('express').Router()
const apiRouter = require('./api/api')

try {
  router.use('/api', apiRouter)
  router.get('/', (req, res) => {
    res.status(202).json({ message: 'welcome to lightbox' })
  })
} catch (err) {
  console.error(err)
}
module.exports = router
