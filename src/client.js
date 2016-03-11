'use strict'

const redis = require('redis')
const uuid = require('node-uuid')

function createClient (connString) {
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

  ctx.disconnect = () => {
    ctx.pubClient.quit()
    ctx.subClient.quit()
    ctx.pubClient = null
    ctx.subClient = null
  }

  ctx.call = (method, params, cb) => {
    const req = {
      method: method,
      params: params,
      queue: `rpc.${uuid.v1()}`
    }

    const reqText = JSON.stringify(req)

    ctx.pubClient.rpush(`rpc.${method}`, reqText)

    // listen for response
    ctx.subClient.blpop(req.queue, 5, (err, result) => {
      if (!result) {
        cb(new Error(`Method not found: ${method}`))
        return
      }

      if (err) {
        cb(err)
        return
      }

      const resText = result[1]
      const res = JSON.parse(resText)

      cb(null, res)
    })
  }

  return ctx
}

module.exports = createClient
