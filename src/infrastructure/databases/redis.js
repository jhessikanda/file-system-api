const redis = require("redis");
const { promisify } = require("util");

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

console.log(host, port);

const connect = {
  getAsync: () => {
    const client = redis.createClient(port, host);
    return promisify(client.get).bind(client);
  },
  setAsync: () => {
    const client = redis.createClient(port, host);
    return promisify(client.set).bind(client);
  },
  keysAsync: () => {
    const client = redis.createClient(port, host);
    return promisify(client.keys).bind(client);
  },
  expire: () => {
    const client = redis.createClient(port, host);
    return promisify(client.expire).bind(client);
  },
};

module.exports = {
  getAsync: connect.getAsync,
  setAsync: connect.setAsync,
  keysAsync: connect.keysAsync,
  expire: connect.expire,
};
