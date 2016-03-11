# node-rpc-redis

An early stage RPC client and server for Redis and Node.js.

## Usage

### Client

```js
const createClient = require('node-rpc-redis/src/client')

const client = createClient('redis://localhost')

// First connect to the Redis server
client.connect((connectionErr) => {  
  if (connectionErr) {
    // handle error
    client.disconnect()
    process.exit(1)
  } else {
    client.call('smalltalk.greet', (callErr, result) => {
      if (callErr) {
        // handle error
      } else {
        console.log('result of RPC call', result)
      }
    })
  }
})
```

### Server

```js
const createServer = require('node-rpc-redis/src/server')

const server = createServer('redis://localhost')

// First connect to the Redis server
server.connect((connectionErr) => {  
  if (connectionErr) {
    // handle error
    server.disconnect()
    process.exit(1)
  } else {
    server.handle('smalltalk.greet', (params, cb) => {
      cb(null, {message: 'Hello, world!'})
    })
  }
})
```
