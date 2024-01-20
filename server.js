const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const http = require('http')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const { initSocket } = require('./utility/socket')
const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const socketio = require('socket.io').listen(server)
const databaseConnection = require('./utility/dbConnection')

const requestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100, // Limit each IP to 100 requests per 'window'(5 minutes).
  standardHeaders: 'draft-7', // draft-6: 'RateLimit-*' headers; draft-7: combined 'RateLimit' header
  legacyHeaders: false, // Disable the 'X-RateLimit-*' headers.
})

dotenv.config()
app.use(helmet())
app.use(requestLimiter)
app.use(cookieParser())
app.use(express.json({ limit: '100MB' }))
app.use(cors({ credentials: true, origin: true }))
app.set('io', socketio)
initSocket(socketio)

app.use('/', routes)

const startServer = async () => {
  try {
    await databaseConnection()
    server.listen(port, () => console.log('Server started on port ' + port))
  } catch (error) {
    console.error('Error connecting to db =>', error)
  }
}

startServer()
