'use strict'

const redis = require('redis')
const uuid = require('node-uuid')

function createClient (redisURL, opts) {
  opts = (opts || {})

  // This setting is used to determine for how long (in seconds) to block the
  // Redis list. See `subClient.blpop` below and read more in the docs:
  // http://redis.io/commands/BLPOP).
  const ttl = opts.ttl || 1

  // Redis client for publishing
  let pubClient = null

  // Redis client for subscribing
  let subClient = null

  return {
    connect: connect,
    disconnect: disconnect,
    call: call
  }

  function connect (cb) {
    pubClient = redis.createClient(redisURL)
    subClient = redis.createClient(redisURL)

    cb(null)
  }

  function disconnect () {
    pubClient.quit()
    subClient.quit()

    pubClient = null
    subClient = null
  }

  function call (method, params, cb) {
    const req = {
      method: method,
      params: params,
      queue: `rpc.${uuid.v1()}`
    }

    const reqText = JSON.stringify(req)

    pubClient.rpush(`rpc.${method}`, reqText)

    // Subscribe to the response queue (a redis list)
    subClient.blpop(req.queue, ttl, (err, result) => {
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
}

module.exports = createClient
