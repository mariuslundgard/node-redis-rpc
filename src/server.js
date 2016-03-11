'use strict'

const redis = require('redis')

function createServer (connString) {
  const ctx = {
    connString: connString,
    pubClient: null,
    subClient: null
  }

  ctx.connect = (cb) => {
    ctx.pubClient = redis.createClient(ctx.connString)
    ctx.subClient = redis.createClient(ctx.connString)
    cb(null)
  }

  function handleRequest (method, handler, req) {

    handler(req.params, (err, result) => {
      ctx.pubClient.rpush(req.queue, JSON.stringify(result))
      ctx.pubClient.expire(req.queue, 1)

      ctx.handle(method, handler)
    })
  }

  ctx.handle = (method, handler) => {
    ctx.subClient.blpop(`rpc.${method}`, 5000, (err, results) => {
      const reqText = results[1]
      const req = JSON.parse(reqText)

      handleRequest(method, handler, req)
    })
  }

  return ctx
}

module.exports = createServer
