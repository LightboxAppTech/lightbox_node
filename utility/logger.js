const { addColors, format, createLogger, transports } = require('winston')

const { combine, errors, colorize, printf, timestamp, json } = format

addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
})

module.exports = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    colorize({ all: true }),
    printf((info) => `${info.timestamp} | ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()],
})

/*
format: combine(errors({ stack: true }), timestamp(), json())
transports: [
  new transports.Console(),
  // new transports.File({ filename: 'logs/example.log' }),
  // new transports.File({ level: 'error', filename: 'logs/error.log' }),
],
rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
*/
