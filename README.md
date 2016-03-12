# node-rpc-redis

A minimal Redis-based RPC client/server module for Node.js.

## Installation

```sh
npm install node-rpc-redis
```

## Why?

I want a clean, simple and reliable way of communicating between microservices written in Node.js.

## Usage

### Client

```js
const createClient = require('node-rpc-redis/src/client')

const client = createClient('redis://localhost')

// First connect to the Redis server
client.connect((connectionErr) => {  
  if (connectionErr) {
    // Handle error and kill the process
  } else {
    const params = {
      name: 'world'
    }

    // Call a routine on a remote service
    client.call('smalltalk.greet', params, (callErr, result) => {
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
    // Handle error and kill the process
  } else {
    // Handle a call from a remote service
    server.handle('smalltalk.greet', (params, cb) => {
      cb(null, {message: `Hello, ${params.name}!`})
    })
  }
})
```
