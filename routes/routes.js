const router = require('express').Router()
const apiRouter = require('./api')

router.use('/api', apiRouter)
router.get('/', (req, res) => {
  res.status(202).json({ message: 'Welcome to Lightbox' })
})

module.exports = router
