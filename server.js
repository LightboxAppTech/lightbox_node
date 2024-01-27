const cookieParser = require('cookie-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const { rateLimit } = require('express-rate-limit')
const helmet = require('helmet')
const http = require('http')
const morgan = require('morgan')

const { initSocket } = require('./utility/socket')
const databaseConnection = require('./utility/dbConnection')
const logger = require('./utility/logger')
const routes = require('./routes/routes')

const port = process.env.APP_PORT

const app = express()
const server = http.createServer(app)
const socketio = require('socket.io').listen(server)

const requestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100, // Limit each IP to 100 requests per 'window'(5 minutes).
  standardHeaders: 'draft-7', // draft-6: 'RateLimit-*' headers; draft-7: combined 'RateLimit' header
  legacyHeaders: false, // Disable the 'X-RateLimit-*' headers.
})

const morganMiddleware = morgan(
  ':method :url | Code::status | Response::response-time ms',
  {
    stream: { write: (message) => logger.http(message) },
    skip: process.env.NODE_ENV !== 'development',
  }
)

dotenv.config()
app.use(helmet())
app.use(requestLimiter)
app.use(cookieParser())
app.use(express.json({ limit: '100MB' }))
app.use(cors({ credentials: true, origin: true }))
app.use(morganMiddleware)
app.set('io', socketio)
initSocket(socketio)

app.use('/', routes)

const startServer = async () => {
  try {
    await databaseConnection()
    server.listen(port, () => logger.info('Server started on port ' + port))
  } catch (error) {
    logger.error('Error connecting to database =>', error)
  }
}

startServer()
