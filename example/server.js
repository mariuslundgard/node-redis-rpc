'use strict'

const createServer = require('../src').createServer
const redisURL = process.env.REDIS_URL

if (!redisURL) {
  throw new Error('Missing environment variable REDIS_URL')
}

const server = createServer(redisURL)

server.connect((err) => {
  server.handle('stats.get', (params, cb) => {
    cb(null, process.memoryUsage())
  })

  server.handle('foo.get', (params, cb) => {
    cb(null, {title: 'Foo'})
  })

  server.handle('bar.get', (params, cb) => {
    cb(null, {title: 'Bar'})
  })
})
