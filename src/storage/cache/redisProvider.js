const redis = require('redis');
const _ = require('lodash');
const config = require('../../config');
const logger = require('../../logging/consoleLogger');

class RedisCacheProvider {
  constructor() {
    this.client = redis.createClient(config.redis.port, config.redis.host);
    this.client.on('error', err => {
      logger.error(`Error, ${err}`);
    });
  }
  set(key, value, expire) {
    if (!_.isString(key)) {
      throw new Error('key is not a string');
    }
    this.client.set(key, value);
    if (!_.isNumber(expire)) {
      return;
    }
    this.client.expire(key, expire);
  }
  get(key) {
    if (!_.isString(key)) {
      return Promise.reject('key is not a string');
    }
    return this._get(key);
  }
  remove(key) {
    if (!_.isString(key)) {
      throw new Error('key is not a string');
    }
    this.client.del(key);
  }
  _get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }
}

module.exports = new RedisCacheProvider();