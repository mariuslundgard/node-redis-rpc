'use strict'

const createClient = require('../src').createClient
const redisURL = process.env.REDIS_URL

if (!redisURL) {
  throw new Error('Missing environment variable $REDIS_URL')
}

const rpc = createClient(redisURL)

function doServiceCall (method, params) {
  return new Promise((resolve, reject) => {
    const startTime = new Date().getTime()

    rpc.call(method, params || {}, (err, res) => {
      if (err) {
        reject(err)
      } else {
        res.time = startTime
        res.responseTime = new Date().getTime() - startTime

        resolve(res)
      }
    })
  })
}

rpc.connect((err) => {
  if (err) {
    console.error(err.stack)
    process.exit(1)
  } else {
    setInterval(() => {
      const startTime = new Date().getTime()
      const stats = doServiceCall('stats.get')
      const foo = doServiceCall('foo.get')
      const bar = doServiceCall('bar.get')

      Promise.all([stats, foo, bar])
        .then((results) => {
          console.log(new Date().getTime() - startTime, results)
        })
        .catch((err) => {
          console.log(new Date().getTime() - startTime, err)
        })
    }, 2000)
  }
})
