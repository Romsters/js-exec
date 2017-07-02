const vm = require('./vm.js');
const storage = require('./storage.js');
const redis = require('./redis.js');
const rabbitMQ = require('./rabbitMQ.js');

module.exports = {
  vm,
  storage,
  redis,
  rabbitMQ,
  childProcessTimeout: 2000,
  requestsQueueName: 'requests'
};