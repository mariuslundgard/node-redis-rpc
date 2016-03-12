'use strict'

const redis = require('redis')

function createServer (redisURL, opts) {
  opts = (opts || {})

  const ttl = opts.ttl || 5

  let pubClient = null
  let subClient = null

  return {
    connect: connect,
    handle: handle
  }

  function connect (cb) {
    pubClient = redis.createClient(redisURL)
    subClient = redis.createClient(redisURL)

    cb(null)
  }

  function handleRequest (method, handler, req) {
    handler(req.params, (err, result) => {
      pubClient.rpush(req.queue, JSON.stringify(result))
      pubClient.expire(req.queue, 1)

      handle(method, handler)
    })
  }

  function handle (method, handler) {
    subClient.blpop(`rpc.${method}`, 0, (err, results) => {
      const reqText = results[1]
      const req = JSON.parse(reqText)

      handleRequest(method, handler, req)
    })
  }
}

module.exports = createServer
